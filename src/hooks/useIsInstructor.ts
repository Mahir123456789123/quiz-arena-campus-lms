
import { useAuth } from '@/lib/auth';

export const useIsInstructor = () => {
  const { profile } = useAuth();
  return profile?.role === 'instructor';
};
