
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateCourseFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateCourseForm = ({ userId, onSuccess, onCancel }: CreateCourseFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          instructor_id: userId,
          title: formData.title,
          description: formData.description,
          code: null
        } as any);

      if (error) throw error;

      toast.success('Course created successfully');
      setFormData({ title: '', description: '' });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription>Fill in the details for your new course</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Course Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create Course</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
