
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface CourseDiscussion {
  id: string;
  course_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useCourseDiscussions = (courseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from('course_discussions')
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as CourseDiscussion[];
  };

  const { data: discussions, isLoading } = useQuery({
    queryKey: ['course_discussions', courseId],
    queryFn: fetchDiscussions,
    enabled: !!courseId
  });

  const createDiscussion = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: courseId,
          user_id: user?.id,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_discussions', courseId] });
      toast.success('Message posted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to post message');
      console.error('Error posting discussion:', error);
    }
  });

  const deleteDiscussion = useMutation({
    mutationFn: async (discussionId: string) => {
      const { error } = await supabase
        .from('course_discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_discussions', courseId] });
      toast.success('Message deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete message');
      console.error('Error deleting discussion:', error);
    }
  });

  return {
    discussions,
    isLoading,
    createDiscussion: createDiscussion.mutate,
    deleteDiscussion: deleteDiscussion.mutate
  };
};
