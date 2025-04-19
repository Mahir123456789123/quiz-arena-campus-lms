
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

interface ContentUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ContentUploadModal: React.FC<ContentUploadModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
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

    setIsUploading(true);
    try {
      // Upload file if exists
      let filePath = null;
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;
        filePath = fileName;
      }

      // Create content record
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title: formData.title,
          author_id: user.id,
          author_name: user.email,
          type: formData.type,
          subject: formData.subject,
          article_snippet: formData.articleSnippet,
          file_path: filePath,
          is_published: true
        });

      if (insertError) throw insertError;

      toast.success('Content uploaded successfully!');
      onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload content');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Upload Content</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="type">Content Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="ppt">Presentation</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'article' && (
            <div>
              <Label htmlFor="snippet">Article Snippet</Label>
              <Textarea
                id="snippet"
                value={formData.articleSnippet}
                onChange={(e) => setFormData(prev => ({ ...prev, articleSnippet: e.target.value }))}
              />
            </div>
          )}

          <div>
            <Label htmlFor="file">File Upload</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentUploadModal;
