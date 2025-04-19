
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";

interface ContentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ContentUploadModal = ({ isOpen, onClose, onSuccess }: ContentUploadModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("article");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload content",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your content",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert into chapter_materials table (based on the database schema)
      const { error } = await supabase
        .from('chapter_materials')
        .insert({
          title,
          content: content || null,
          url: url || null,
          type,
          chapter_id: "default-chapter-id", // This would need to be properly set based on your app's logic
          is_assignment: false
        });
      
      if (error) throw error;
      
      toast({
        title: "Content uploaded",
        description: "Your content has been successfully uploaded",
      });
      
      // Reset form and close modal
      setTitle("");
      setContent("");
      setType("article");
      setUrl("");
      onClose();
      
      // Trigger any additional success callback
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error uploading content:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your content",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload New Content</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter content title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Content Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {type === 'link' ? (
            <div className="space-y-2">
              <Label htmlFor="url">External URL</Label>
              <Input 
                id="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://example.com/resource"
                type="url"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Enter your content here"
                rows={6}
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploadModal;
