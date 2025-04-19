
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
      // Fetch the course using trimmed code (case insensitive)
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('id, title, code')
        .ilike('code', courseCode.trim());

      if (courseError) {
        console.error('Error fetching course:', courseError);
        throw courseError;
      }
      
      console.log('Found courses:', courses);
      
      // Check if any courses were found with this code
      if (!courses || courses.length === 0) {
        toast.error('Course not found. Please check the code and try again.');
        setIsLoading(false);
        return;
      }

      const course = courses[0];
      console.log('Found course:', course);

      // Check if the user is already enrolled in this course
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

      // Create the enrollment
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your progress and manage your courses</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-80">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrollments.length}</div>
              <BookOpen className="absolute bottom-4 right-4 h-12 w-12 opacity-20" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-80">Hours Studied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <Clock className="absolute bottom-4 right-4 h-12 w-12 opacity-20" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-80">Completed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <Award className="absolute bottom-4 right-4 h-12 w-12 opacity-20" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-80">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">85%</div>
              <BarChart3 className="absolute bottom-4 right-4 h-12 w-12 opacity-20" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-5 w-5 text-primary" />
                Join a Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinCourse} className="space-y-4">
                <div>
                  <Input
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="Enter course code"
                    className="w-full"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Joining...' : 'Join Course'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollments.map((enrollment: any) => (
                  <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
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
