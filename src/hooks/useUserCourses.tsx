
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export const useUserCourses = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['courses', user?.id],
    queryFn: async () => {
      if (!user || !profile) return [];
      
      // Only instructors get their own courses
      if (profile.role === 'instructor') {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', user.id);
          
        if (error) throw error;
        return data || [];
      } 
      // Students need to access courses through enrollments
      else if (profile.role === 'student') {
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            course:courses(*)
          `)
          .eq('student_id', user.id);
          
        if (error) throw error;
        return (data || []).map(enrollment => enrollment.course);
      }
      // Admins see all courses
      else if (profile.role === 'admin') {
        const { data, error } = await supabase
          .from('courses')
          .select('*');
          
        if (error) throw error;
        return data || [];
      }
      
      return [];
    },
    enabled: !!user && !!profile,
  });
};
