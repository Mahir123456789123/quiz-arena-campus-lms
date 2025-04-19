
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface ContentUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ContentUploadModal: React.FC<ContentUploadModalProps> = ({ onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    type: '',
    articleSnippet: '',
    file: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.title || !formData.subject || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      let filePath = null;

      // Handle file upload if a file is selected
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;
        filePath = fileName;
      }

      // Create content entry
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title: formData.title,
          subject: formData.subject,
          type: formData.type,
          article_snippet: formData.type === 'article' ? formData.articleSnippet : null,
          file_path: filePath,
          author_id: user.id,
          author_name: profile?.full_name || user.email
        });

      if (insertError) throw insertError;

      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload content');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-card dark:bg-card p-6 rounded-xl max-w-md w-full shadow-xl border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-foreground">Upload Content</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-background text-foreground border-input"
            />
          </div>

          <div>
            <Label htmlFor="subject" className="text-foreground">Subject</Label>
            <Input
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="bg-background text-foreground border-input"
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-foreground">Content Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger id="type" className="bg-background text-foreground border-input">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="ppt">Presentation</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'article' && (
            <div>
              <Label htmlFor="snippet" className="text-foreground">Article Snippet</Label>
              <Textarea
                id="snippet"
                value={formData.articleSnippet}
                onChange={(e) => setFormData(prev => ({ ...prev, articleSnippet: e.target.value }))}
                className="bg-background text-foreground border-input"
              />
            </div>
          )}

          <div>
            <Label htmlFor="file" className="text-foreground">File Upload</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              className="bg-background text-foreground border-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-input text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentUploadModal;
