
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useEnrollments } from '@/hooks/useEnrollments';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courseCode, setCourseCode] = useState('');
  const { data: enrollments = [], refetch: refetchEnrollments } = useEnrollments();

  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (courseCode.length !== 3) {
      toast.error('Course code must be 3 digits');
      return;
    }
    
    try {
      // First, get the course ID using the code
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('code', courseCode)
        .single();

      if (courseError || !course) {
        throw new Error('Course not found');
      }

      // Then create the enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          student_id: user?.id,
          course_id: course.id
        });

      if (enrollError) throw enrollError;

      toast.success('Successfully enrolled in course');
      setCourseCode('');
      refetchEnrollments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your learning journey</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>My Courses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{enrollment.course.title}</h3>
                    <p className="text-sm text-muted-foreground">{enrollment.course.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Join a Course</span>
              </CardTitle>
              <CardDescription>Enter a 3-digit course code to enroll</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinCourse} className="flex gap-2">
                <Input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. 123"
                  maxLength={3}
                  pattern="[0-9]{3}"
                  className="flex-1"
                />
                <Button type="submit">Join</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
