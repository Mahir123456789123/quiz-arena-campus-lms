
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAssignments = (studentId?: string) => {
  return useQuery({
    queryKey: ['assignments', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          chapter_materials (
            title,
            chapter: chapters (
              title,
              course: courses (
                title
              )
            )
          ),
          submissions (*)
        `)
        .eq('submissions.student_id', studentId)
        .order('deadline');

      if (error) throw error;
      return data;
    },
    enabled: !!studentId
  });
};
