
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, Award, BarChart3, PlayCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useEnrollments } from '@/hooks/useEnrollments';
import ProgressGraphs from '@/components/dashboard/ProgressGraphs';
import { DeadlinesCalendar } from '@/components/dashboard/DeadlinesCalendar';
import PomodoroTimer from '@/components/dashboard/PomodoroTimer';
import TodoList from '@/components/dashboard/TodoList';
import { CreateMeetingButton } from '@/components/video/CreateMeetingButton';

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
    
    try {
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('id, title, code')
        .ilike('code', courseCode.trim());

      if (courseError) throw courseError;
      
      if (!courses || courses.length === 0) {
        toast.error('Course not found. Please check the code and try again.');
        return;
      }

      const course = courses[0];

      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user?.id)
        .eq('course_id', course.id);
        
      if (enrollmentCheckError) throw enrollmentCheckError;
      
      if (existingEnrollment && existingEnrollment.length > 0) {
        toast.error('You are already enrolled in this course');
        return;
      }

      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          student_id: user?.id,
          course_id: course.id
        });

      if (enrollError) throw enrollError;

      toast.success(`Successfully enrolled in "${course.title}"`);
      setCourseCode('');
      refetchEnrollments();
    } catch (error: any) {
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <PomodoroTimer />
          <TodoList />
          <Card className="bg-gradient-to-br from-card to-background border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="h-5 w-5 text-primary" />
                Upcoming Meetings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">No scheduled meetings</p>
              <CreateMeetingButton className="w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <DeadlinesCalendar />
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
                  <Card key={enrollment.id} className="bg-background/50 hover:shadow-md transition-shadow">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base font-medium flex items-center justify-between">
                        {enrollment.course.title}
                        <Button variant="ghost" size="sm" asChild className="gap-2">
                          <Link to={`/courses/${enrollment.course.id}`}>
                            <PlayCircle className="h-4 w-4" />
                            Continue Learning
                          </Link>
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Clock className="h-4 w-4" />
                          <span>Last accessed: Recently</span>
                        </div>
                      </CardDescription>
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
