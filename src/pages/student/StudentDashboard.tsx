import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, Award, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useEnrollments } from '@/hooks/useEnrollments';
import ProgressGraphs from '@/components/dashboard/ProgressGraphs';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courseCode, setCourseCode] = useState('');
  const { data: enrollments = [], refetch: refetchEnrollments } = useEnrollments();
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }
    
    setIsLoading(true);
    console.log('Attempting to join course with code:', courseCode.trim());
    
    try {
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('id, title, code')
        .ilike('code', courseCode.trim());

      if (courseError) {
        console.error('Error fetching course:', courseError);
        throw courseError;
      }
      
      console.log('Found courses:', courses);
      
      if (!courses || courses.length === 0) {
        toast.error('Course not found. Please check the code and try again.');
        setIsLoading(false);
        return;
      }

      const course = courses[0];
      console.log('Found course:', course);

      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user?.id)
        .eq('course_id', course.id);
        
      if (enrollmentCheckError) {
        console.error('Error checking enrollment:', enrollmentCheckError);
        throw enrollmentCheckError;
      }
      
      console.log('Existing enrollment check:', existingEnrollment);
      
      if (existingEnrollment && existingEnrollment.length > 0) {
        toast.error('You are already enrolled in this course');
        setIsLoading(false);
        return;
      }

      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          student_id: user?.id,
          course_id: course.id
        });

      if (enrollError) {
        console.error('Error creating enrollment:', enrollError);
        throw enrollError;
      }

      console.log('Successfully enrolled in course:', course.title);
      toast.success(`Successfully enrolled in "${course.title}"`);
      setCourseCode('');
      refetchEnrollments();
    } catch (error: any) {
      console.error('Error joining course:', error);
      toast.error(error.message || 'Failed to join course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/50">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Track your progress and manage your courses</p>
        </div>

        <div className="grid gap-6 mb-8">
          <ProgressGraphs />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-card to-background border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-5 w-5 text-primary" />
                Join a Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinCourse} className="space-y-4">
                <Input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Enter course code"
                  className="w-full bg-background/50 border-muted"
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Joining...' : 'Join Course'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {enrollments.length > 0 && (
            <Card className="bg-gradient-to-br from-card to-background border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollments.map((enrollment: any) => (
                  <Card key={enrollment.id} className="bg-background/50 hover:shadow-md transition-shadow border-muted">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base font-medium">{enrollment.course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{enrollment.course.description}</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link to={`/courses/${enrollment.course.id}`}>View Course</Link>
                      </Button>
                    </CardHeader>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
