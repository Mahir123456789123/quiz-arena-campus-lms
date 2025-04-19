
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import AdminDashboard from './admin/AdminDashboard';
import InstructorDashboard from './instructor/InstructorDashboard';
import StudentDashboard from './student/StudentDashboard';
import { toast } from 'sonner';
import { UserRole } from '@/lib/auth';

const Dashboard = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        // First, check for role in user metadata (set during signup)
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const metadataRole = authUser?.user_metadata?.role as UserRole | undefined;
        
        if (metadataRole) {
          console.log("User role from auth metadata:", metadataRole);
          setUserRole(metadataRole);
          
          // Ensure the profile table has the correct role
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: metadataRole })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error syncing profile role:', updateError);
          }
        } else {
          // Fallback to checking the profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          console.log("User role from database:", data?.role);
          setUserRole(data?.role as UserRole || 'student');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        toast.error('Error loading your profile');
        setUserRole('student'); // Default to student if there's an error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Route to the appropriate dashboard based on user role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
