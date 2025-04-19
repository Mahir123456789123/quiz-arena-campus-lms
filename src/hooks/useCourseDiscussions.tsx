
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CourseDiscussion } from '@/types/course';

export const useCourseDiscussions = (courseId: string) => {
  return useQuery({
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
};
