
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CourseDiscussion } from '@/types/course';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

export const useCourseDiscussions = (courseId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: discussions = [], isLoading, error } = useQuery({
    queryKey: ['courseDiscussions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_discussions')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the CourseDiscussion type
      const discussions = data.map((discussion: any) => ({
        ...discussion,
        profiles: {
          full_name: discussion.profiles?.full_name || '',
          avatar_url: discussion.profiles?.avatar_url || ''
        }
      })) as CourseDiscussion[];

      return discussions;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('You must be logged in to post');
      
      const { data, error } = await supabase
        .from('course_discussions')
        .insert({
          content,
          course_id: courseId,
          user_id: user.id
        })
        .select(`
          *,
          profiles (
            full_name, 
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseDiscussions', courseId] });
      toast.success('Message posted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to post message');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (discussionId: string) => {
      const { error } = await supabase
        .from('course_discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
      return discussionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseDiscussions', courseId] });
      toast.success('Message deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete message');
    }
  });

  return {
    discussions,
    isLoading,
    error,
    createDiscussion: createMutation.mutate,
    deleteDiscussion: deleteMutation.mutate
  };
};
