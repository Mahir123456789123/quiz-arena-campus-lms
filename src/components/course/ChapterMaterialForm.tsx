
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, FileVideo, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterMaterialFormProps {
  chapterId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ChapterMaterialForm = ({ chapterId, onSuccess, onCancel }: ChapterMaterialFormProps) => {
  const [type, setType] = useState<'text' | 'file' | 'video'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAssignment, setIsAssignment] = useState(false);
  const [deadline, setDeadline] = useState<Date>();
  const [totalMarks, setTotalMarks] = useState(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    try {
      let url = null;

      if ((type === 'file' || type === 'video') && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${chapterId}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${chapterId}/${fileName}`;

        const { error: uploadError } = await supabase
          .storage
          .from('course-materials')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
          .storage
          .from('course-materials')
          .getPublicUrl(filePath);

        url = publicUrl;
      }

      const { data: materialData, error: materialError } = await supabase
        .from('chapter_materials')
        .insert({
          chapter_id: chapterId,
          title,
          type,
          content: type === 'text' ? content : null,
          url,
          is_assignment: isAssignment
        })
        .select()
        .single();

      if (materialError) throw materialError;

      if (isAssignment && deadline) {
        // Convert Date to ISO string for database
        const deadlineStr = deadline.toISOString();
        
        const { error: assignmentError } = await supabase
          .from('assignments')
          .insert({
            material_id: materialData.id,
            title,
            description: content,
            deadline: deadlineStr,
            total_marks: totalMarks
          });

        if (assignmentError) throw assignmentError;
      }

      toast.success('Material added successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Material Type</label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as 'text' | 'file' | 'video')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="file">Document/PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter material title"
              required
            />
          </div>

          {type === 'text' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter text content"
                rows={5}
                required
              />
            </div>
          )}

          {(type === 'file' || type === 'video') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload {type === 'file' ? 'Document' : 'Video'}</label>
              <div className="border rounded-md p-4">
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type === 'file' ? <FileText className="h-5 w-5" /> : <FileVideo className="h-5 w-5" />}
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                      accept={type === 'file' ? ".pdf,.doc,.docx,.txt" : "video/*"}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center py-4">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload {type === 'file' ? 'document' : 'video'}
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Is this an assignment?</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAssignment}
                onChange={(e) => setIsAssignment(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">This material requires submission</span>
            </div>
          </div>

          {isAssignment && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deadline</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : <span>Pick a deadline</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Total Marks</label>
                <Input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  min={1}
                  required={isAssignment}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChapterMaterialForm;
