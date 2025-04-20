
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListChecks } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface StudyGoal {
  id: string;
  text: string;
  completed: boolean;
}

const TodoList = () => {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('study_goals')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to fetch study goals');
      return;
    }
    setGoals(data);
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) {
      toast.error('Please enter a goal');
      return;
    }

    const { error } = await supabase
      .from('study_goals')
      .insert([
        { 
          text: newGoal.trim(),
          user_id: user?.id
        }
      ]);

    if (error) {
      toast.error('Failed to add goal');
      return;
    }
    
    setNewGoal('');
    fetchGoals();
    toast.success('Goal added');
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('study_goals')
      .update({ completed })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update goal');
      return;
    }

    fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('study_goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove goal');
      return;
    }

    fetchGoals();
    toast.success('Goal removed');
  };

  return (
    <Card className="bg-blue-100 dark:bg-blue-600 text-black dark:text-white transition-colors">

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Study Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addGoal} className="flex gap-2 mb-4">
          <Input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a new study goal..."
            className="flex-1"
          />
          <Button type="submit" className="dark:bg-blue-400">Add</Button>
        </form>
        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-blue-400 text-black hover:bg-blue-200 group"
            >
              <Checkbox
                checked={goal.completed}
                onCheckedChange={(checked) => toggleGoal(goal.id, checked as boolean)}
              />
              <span className={`flex-1 ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                {goal.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600"
                onClick={() => deleteGoal(goal.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoList;
