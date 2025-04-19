
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Users, MessageSquare, FileText, 
  PlusCircle, Trash2, PencilIcon, Send, UserCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useCourseChapters, useChapterMutations } from '@/hooks/useCourseChapters';
import { useCourseComments, useCommentMutations } from '@/hooks/useCourseComments';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const CourseManagement = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [comment, setComment] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);

  // Form for creating new chapters
  const chapterForm = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  });

  // Course chapters
  const { data: chapters = [] } = useCourseChapters(courseId || '');
  const { createChapter, deleteChapter } = useChapterMutations(courseId || '');

  // Course comments
  const { data: comments = [] } = useCourseComments(courseId || '');
  const { createComment, deleteComment } = useCommentMutations(courseId || '');

  // Fetch enrolled students
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['course_enrollments', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          student:profiles(id, full_name, avatar_url)
        `)
        .eq('course_id', courseId);
        
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  useEffect(() => {
    if (enrollments) {
      // Extract student profiles from enrollments
      const students = enrollments.map((enrollment: any) => enrollment.student);
      setEnrolledStudents(students);
    }
  }, [enrollments]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
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

  const handleCreateChapter = (data: { title: string; description: string }) => {
    createChapter({
      title: data.title,
      description: data.description,
      order_number: chapters.length + 1
    });
    setShowChapterForm(false);
    chapterForm.reset();
  };

  const handleDeleteChapter = (chapterId: string) => {
    deleteChapter(chapterId);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    createComment(comment);
    setComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
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
          <p className="text-muted-foreground mt-2">Course Code: {course?.code}</p>
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>Manage chapters and learning materials for this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {showChapterForm ? (
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <form onSubmit={chapterForm.handleSubmit(handleCreateChapter)} className="space-y-4">
                          <FormField
                            control={chapterForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Chapter Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter chapter title" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={chapterForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter chapter description" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-2">
                            <Button type="submit">Create Chapter</Button>
                            <Button type="button" variant="outline" onClick={() => setShowChapterForm(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button onClick={() => setShowChapterForm(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Chapter
                    </Button>
                  )}

                  {chapters.length === 0 ? (
                    <div className="text-center p-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No chapters yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Get started by adding your first chapter to this course.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chapters.map((chapter: any, index: number) => (
                        <Card key={chapter.id}>
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">
                                  Chapter {index + 1}: {chapter.title}
                                </CardTitle>
                                {chapter.description && (
                                  <CardDescription className="mt-1">
                                    {chapter.description}
                                  </CardDescription>
                                )}
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the chapter and all its content.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteChapter(chapter.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Manage students enrolled in this course</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEnrollments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2">Loading students...</p>
                  </div>
                ) : enrolledStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No students enrolled</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Share your course code so students can enroll.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Enrolled Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments?.map((enrollment: any) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {enrollment.student.avatar_url ? (
                                <img 
                                  src={enrollment.student.avatar_url} 
                                  alt={enrollment.student.full_name}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <UserCircle className="h-8 w-8 text-muted-foreground" />
                              )}
                              <span>{enrollment.student.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Discussions</CardTitle>
                <CardDescription>Engage with students through course discussion board</CardDescription>
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
                        <div key={comment.id} className="flex gap-3 relative group">
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
                          {user?.id === comment.user_id && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
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
      </main>
      <Footer />
    </div>
  );
};

export default CourseManagement;
