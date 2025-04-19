
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
          profiles (full_name, avatar_url)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as CourseDiscussion[];
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
          user_id: user.id,
          likes: [],
          dislikes: []
        })
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data as unknown as CourseDiscussion;
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

  const likeMutation = useMutation({
    mutationFn: async ({ discussionId, action }: { discussionId: string, action: 'like' | 'dislike' }) => {
      if (!user) throw new Error('You must be logged in to like or dislike');
      
      // First, get the current likes and dislikes
      const { data: discussion, error: fetchError } = await supabase
        .from('course_discussions')
        .select('likes, dislikes')
        .eq('id', discussionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      let likes = discussion.likes || [];
      let dislikes = discussion.dislikes || [];
      
      if (action === 'like') {
        // If already liked, remove like
        if (likes.includes(user.id)) {
          likes = likes.filter((id: string) => id !== user.id);
        } else {
          // Add like and remove from dislikes if present
          likes.push(user.id);
          dislikes = dislikes.filter((id: string) => id !== user.id);
        }
      } else {
        // If already disliked, remove dislike
        if (dislikes.includes(user.id)) {
          dislikes = dislikes.filter((id: string) => id !== user.id);
        } else {
          // Add dislike and remove from likes if present
          dislikes.push(user.id);
          likes = likes.filter((id: string) => id !== user.id);
        }
      }
      
      // Update the discussion
      const { error: updateError } = await supabase
        .from('course_discussions')
        .update({ likes, dislikes })
        .eq('id', discussionId);
      
      if (updateError) throw updateError;
      
      return { discussionId, likes, dislikes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseDiscussions', courseId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update reaction');
    }
  });

  return {
    discussions,
    isLoading,
    error,
    createDiscussion: createMutation.mutate,
    deleteDiscussion: deleteMutation.mutate,
    likeDiscussion: (discussionId: string) => likeMutation.mutate({ discussionId, action: 'like' }),
    dislikeDiscussion: (discussionId: string) => likeMutation.mutate({ discussionId, action: 'dislike' })
  };
};
