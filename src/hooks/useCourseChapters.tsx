
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export const useCourseChapters = (courseId: string) => {
  const { user } = useAuth();

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from('chapters')
      .select(`
        *,
        chapter_materials (*)
      `)
      .eq('course_id', courseId)
      .order('order_number');

    if (error) throw error;
    return data;
  };

  const createChapter = async (chapterData: { 
    title: string, 
    description?: string, 
    order_number?: number 
  }) => {
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        ...chapterData,
        course_id: courseId
      })
      .select();

    if (error) throw error;
    return data[0];
  };

  const deleteChapter = async (chapterId: string) => {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (error) throw error;
  };

  const addChapterMaterial = async (materialData: {
    chapter_id: string,
    title: string,
    type: 'video' | 'file' | 'text',
    content?: string,
    url?: string
  }) => {
    const { data, error } = await supabase
      .from('chapter_materials')
      .insert(materialData)
      .select();

    if (error) throw error;
    return data[0];
  };

  return useQuery({
    queryKey: ['course_chapters', courseId],
    queryFn: fetchChapters,
    enabled: !!courseId
  });
};

export const useChapterMutations = (courseId: string) => {
  const queryClient = useQueryClient();

  const createChapterMutation = useMutation({
    mutationFn: async (chapterData: { 
      title: string, 
      description?: string, 
      order_number?: number 
    }) => {
      const { data, error } = await supabase
        .from('chapters')
        .insert({
          ...chapterData,
          course_id: courseId
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_chapters', courseId] });
      toast.success('Chapter created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create chapter');
      console.error(error);
    }
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);
        
      if (error) throw error;
      return chapterId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_chapters', courseId] });
      toast.success('Chapter deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete chapter');
      console.error(error);
    }
  });

  return {
    createChapter: createChapterMutation.mutate,
    deleteChapter: deleteChapterMutation.mutate
  };
};
