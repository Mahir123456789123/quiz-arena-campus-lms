
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, X, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CourseBrowser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all available courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['available_courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user_enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Enroll in a course
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          student_id: user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_enrollments', user?.id] });
      toast.success('Successfully enrolled in the course!');
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate key')) {
        toast.error('You are already enrolled in this course');
      } else {
        toast.error('Failed to enroll in the course');
      }
    }
  });

  // Enroll with course code
  const enrollWithCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      // First find the course with this code
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('code', code)
        .single();
        
      if (courseError) throw new Error('Invalid course code');
      if (!courseData) throw new Error('Course not found');

      // Then enroll the student
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseData.id,
          student_id: user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_enrollments', user?.id] });
      toast.success('Successfully enrolled in the course!');
      setCourseCode('');
      setShowCodeInput(false);
    },
    onError: (error: any) => {
      if (error.message.includes('Invalid course code') || error.message.includes('Course not found')) {
        toast.error('Invalid course code');
      } else if (error.message.includes('duplicate key')) {
        toast.error('You are already enrolled in this course');
      } else {
        toast.error('Failed to enroll in the course');
      }
    }
  });

  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  const handleEnrollWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim()) return;
    
    enrollWithCodeMutation.mutate(courseCode.trim());
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some((enrollment: any) => enrollment.course_id === courseId);
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter((course: any) => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    course.instructor.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Browse Courses</h1>
            <p className="text-muted-foreground mt-2">
              Discover and enroll in available courses
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {showCodeInput ? (
              <form onSubmit={handleEnrollWithCode} className="flex gap-2">
                <Input
                  placeholder="Enter course code..."
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                />
                <Button type="submit" disabled={!courseCode.trim()}>Enroll</Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCodeInput(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button onClick={() => setShowCodeInput(true)}>Enroll with Code</Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-7 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded mt-2 w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded mt-2 w-5/6"></div>
                  <div className="h-4 bg-muted rounded mt-2 w-4/6"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-medium">No courses found</h2>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or check back later for new courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any) => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    {course.instructor.avatar_url ? (
                      <img 
                        src={course.instructor.avatar_url} 
                        alt={course.instructor.full_name}
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>Instructor: {course.instructor.full_name}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {course.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description provided</p>
                  )}
                </CardContent>
                <CardFooter>
                  {isEnrolled(course.id) ? (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      View Course
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CourseBrowser;
