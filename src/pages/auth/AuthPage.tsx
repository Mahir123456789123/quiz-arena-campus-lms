
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/lib/auth';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        
        // After successful signup, update the profile with the correct role
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', authData.user.id);
            
          if (profileError) {
            console.error('Error updating profile:', profileError);
            toast.error('Account created but role could not be set properly');
          }
        }
        
        toast.success('Check your email to confirm your account!');
      } else {
        // Sign in the user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Book className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">EduHub</CardTitle>
          <CardDescription>
            {isSignUp ? "Create an account to get started" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth}>
            <div className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading 
                  ? "Loading..." 
                  : (isSignUp ? "Create account" : "Sign in")
                }
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            {isSignUp 
              ? "Already have an account? " 
              : "Don't have an account? "
            }
            <button 
              className="underline" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
