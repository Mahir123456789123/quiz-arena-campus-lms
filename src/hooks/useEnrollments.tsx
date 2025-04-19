
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export const useEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get user role first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const role = profileData?.role;
      
      // Only fetch enrollments for students and admins
      if (role === 'student') {
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses(*)
          `)
          .eq('student_id', user.id);
        
        if (error) throw error;
        return data;
      }
      else if (role === 'admin') {
        // Admins can see all enrollments
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses(*)
          `);
        
        if (error) throw error;
        return data;
      }
      
      return [];
    },
    enabled: !!user,
  });
};
