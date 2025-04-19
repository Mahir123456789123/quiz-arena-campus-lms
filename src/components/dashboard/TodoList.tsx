
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListChecks } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) {
      toast.error('Please enter a task');
      return;
    }
    
    setTodos([...todos, { id: crypto.randomUUID(), text: newTodo.trim(), completed: false }]);
    setNewTodo('');
    toast.success('Task added');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast.success('Task removed');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Study Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
          />
          <Button type="submit">Add</Button>
        </form>
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent group"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => deleteTodo(todo.id)}
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
