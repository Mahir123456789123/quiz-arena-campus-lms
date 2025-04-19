
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export const useUserCourses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courses', user?.id],
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
      
      // Different queries based on role
      if (role === 'instructor') {
        // Instructors only see their own courses
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', user.id);
          
        if (error) throw error;
        return data;
      } 
      else if (role === 'admin') {
        // Admins see all courses
        const { data, error } = await supabase
          .from('courses')
          .select('*');
          
        if (error) throw error;
        return data;
      }
      else {
        // For students, this will be filtered by RLS to only show enrolled courses
        // This is just a fallback - students should use useEnrollments instead
        return [];
      }
    },
    enabled: !!user,
  });
};
