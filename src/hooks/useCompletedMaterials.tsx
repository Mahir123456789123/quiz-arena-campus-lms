
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export const useCompletedMaterials = (chapterId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: completedMaterials = [] } = useQuery({
    queryKey: ['completed_materials', chapterId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('completed_materials')
        .select('material_id')
        .eq('student_id', user.id);
        
      if (error) {
        toast.error('Failed to fetch completed materials');
        throw error;
      }
      
      return data.map(item => item.material_id);
    },
    enabled: !!user && !!chapterId,
  });

  const markAsCompleted = useMutation({
    mutationFn: async (materialId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('completed_materials')
        .insert({
          student_id: user.id,
          material_id: materialId,
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed_materials'] });
      toast.success('Progress saved!');
    },
    onError: () => {
      toast.error('Failed to save progress');
    },
  });

  return {
    completedMaterials,
    markAsCompleted: markAsCompleted.mutate,
    isMarkingComplete: markAsCompleted.isPending,
  };
};
