
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export const useCourseComments = (courseId: string) => {
  const { user } = useAuth();

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  };

  return useQuery({
    queryKey: ['course_comments', courseId],
    queryFn: fetchComments,
    enabled: !!courseId
  });
};

export const useCommentMutations = (courseId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('comments')
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
      queryClient.invalidateQueries({ queryKey: ['course_comments', courseId] });
      toast.success('Comment posted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to post comment');
      console.error(error);
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      return commentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_comments', courseId] });
      toast.success('Comment deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete comment');
      console.error(error);
    }
  });

  return {
    createComment: createCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate
  };
};
