
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface ChapterMaterial {
  id: string;
  chapter_id: string;
  title: string;
  type: 'text' | 'file' | 'video';
  content?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

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

  const deleteChapterMaterial = async (materialId: string) => {
    const { error } = await supabase
      .from('chapter_materials')
      .delete()
      .eq('id', materialId);

    if (error) throw error;
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

  const addMaterialMutation = useMutation({
    mutationFn: async (materialData: {
      chapter_id: string;
      title: string;
      type: 'text' | 'file' | 'video';
      content?: string;
      url?: string;
    }) => {
      const { data, error } = await supabase
        .from('chapter_materials')
        .insert(materialData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_chapters', courseId] });
      toast.success('Material added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add material');
      console.error(error);
    }
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('chapter_materials')
        .delete()
        .eq('id', materialId);
        
      if (error) throw error;
      return materialId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_chapters', courseId] });
      toast.success('Material deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete material');
      console.error(error);
    }
  });

  return {
    createChapter: createChapterMutation.mutate,
    deleteChapter: deleteChapterMutation.mutate,
    addMaterial: addMaterialMutation.mutate,
    deleteMaterial: deleteMaterialMutation.mutate
  };
};
