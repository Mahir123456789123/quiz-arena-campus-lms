
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, MessageSquare, FileText, 
  Send, UserCircle, CheckCircle, BarChart 
} from 'lucide-react';
import { toast } from 'sonner';
import { useCourseChapters } from '@/hooks/useCourseChapters';
import { useCourseComments, useCommentMutations } from '@/hooks/useCourseComments';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  // Course chapters
  const { data: chapters = [] } = useCourseChapters(courseId || '');

  // Course comments
  const { data: comments = [] } = useCourseComments(courseId || '');
  const { createComment } = useCommentMutations(courseId || '');

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            instructor:profiles(full_name, avatar_url)
          `)
          .eq('id', courseId)
          .single();

        if (error) throw error;
        if (!data) {
          toast.error('Course not found');
          navigate('/dashboard');
          return;
        }

        setCourse(data);
      } catch (error: any) {
        toast.error(error.message);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  // Fetch study sessions
  const { data: studySessions } = useQuery({
    queryKey: ['study_sessions', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', user?.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId && !!user
  });

  // Calculate progress based on completed modules
  useEffect(() => {
    if (chapters.length > 0 && studySessions) {
      // Simple progress calculation based on the count of completed modules
      const totalCompletedModules = studySessions.reduce((sum: number, session: any) => 
        sum + (session.completedmodules || 0), 0);
      
      const totalModules = chapters.length;
      const calculatedProgress = totalModules > 0 
        ? Math.min(100, (totalCompletedModules / totalModules) * 100) 
        : 0;
        
      setProgress(calculatedProgress);
    }
  }, [chapters, studySessions]);

  // Update study session - mark a module as completed
  const completeModuleMutation = useMutation({
    mutationFn: async ({ chapterIndex }: { chapterIndex: number }) => {
      // First, check if we have a study session for today
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingSessions, error: fetchError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', user?.id)
        .eq('date', today);
        
      if (fetchError) throw fetchError;
      
      if (existingSessions && existingSessions.length > 0) {
        // Update existing session
        const session = existingSessions[0];
        const { error: updateError } = await supabase
          .from('study_sessions')
          .update({ 
            completedmodules: session.completedmodules + 1,
            minutes: session.minutes + 5 // Add 5 minutes of study time
          })
          .eq('id', session.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new session
        const { error: insertError } = await supabase
          .from('study_sessions')
          .insert({
            course_id: courseId,
            student_id: user?.id,
            completedmodules: 1,
            minutes: 5 // Start with 5 minutes
          });
          
        if (insertError) throw insertError;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_sessions', courseId, user?.id] });
      toast.success('Progress updated!');
    },
    onError: (error) => {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  });

  const handleCompleteModule = (chapterIndex: number) => {
    completeModuleMutation.mutate({ chapterIndex });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    createComment(comment);
    setComment('');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{course?.title}</h1>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
          <p className="text-muted-foreground mt-2">
            Instructor: {course?.instructor?.full_name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Course Content
                </TabsTrigger>
                <TabsTrigger value="discussions" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Discussions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Materials</CardTitle>
                    <CardDescription>Work through the chapters below to complete the course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chapters.length === 0 ? (
                      <div className="text-center p-8">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No content yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          The instructor hasn't added any content to this course yet.
                        </p>
                      </div>
                    ) : (
                      <Accordion type="single" collapsible className="w-full">
                        {chapters.map((chapter: any, index: number) => (
                          <AccordionItem key={chapter.id} value={`chapter-${index}`}>
                            <AccordionTrigger className="text-lg font-medium hover:no-underline">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                                  <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-left">
                                  Chapter {index + 1}: {chapter.title}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-14">
                              <div className="space-y-4">
                                {chapter.description && (
                                  <p className="text-muted-foreground">{chapter.description}</p>
                                )}
                                
                                <div className="pt-4">
                                  <Button onClick={() => handleCompleteModule(index)}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Complete
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Discussions</CardTitle>
                    <CardDescription>Engage with your instructor and classmates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border rounded-md p-4 space-y-4 max-h-96 overflow-y-auto">
                        {comments.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No discussions yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Start the conversation by posting a comment.
                            </p>
                          </div>
                        ) : (
                          comments.map((comment: any) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="flex-shrink-0">
                                {comment.profiles?.avatar_url ? (
                                  <img 
                                    src={comment.profiles.avatar_url} 
                                    alt={comment.profiles.full_name}
                                    className="h-10 w-10 rounded-full"
                                  />
                                ) : (
                                  <UserCircle className="h-10 w-10 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{comment.profiles?.full_name}</h4>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="mt-1">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <form onSubmit={handleSendComment} className="flex gap-2">
                        <Input 
                          placeholder="Type your message..." 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={!comment.trim()}>
                          <Send className="h-4 w-4 mr-1" /> Post
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Completion</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Study time</p>
                      <p className="text-sm text-muted-foreground">
                        {studySessions?.reduce((sum: number, session: any) => sum + (session.minutes || 0), 0) || 0} minutes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Chapters completed</p>
                      <p className="text-sm text-muted-foreground">
                        {studySessions?.reduce((sum: number, session: any) => sum + (session.completedmodules || 0), 0) || 0} 
                        {' '} of {chapters.length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
              </CardHeader>
              <CardContent>
                {course.description ? (
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description provided</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseView;
