
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export const useEnrollments = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user || !profile) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*),
          student:profiles(*)
        `);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!profile,
  });
};
