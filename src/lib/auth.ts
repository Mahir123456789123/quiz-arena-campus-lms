
import { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'student' | 'instructor' | 'admin';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  created_at?: string;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
};

export const AuthContext = createContext<AuthContextType>({ user: null, session: null, profile: null });

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
