import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileIcon, Eye, Star, Download } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Content } from '@/types/content';
import { toast } from 'sonner';
import TextToSpeech from "@/components/ui/text-to-speech";

const ContentCard = ({ content }: { content: Content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getIcon = () => {
    switch(content.type) {
      case 'video':
        return <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-500"><FileIcon /></div>;
      case 'article':
        return <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-500"><FileIcon /></div>;
      case 'ppt':
        return <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100 text-orange-500"><FileIcon /></div>;
      default:
        return <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500"><FileIcon /></div>;
    }
  };

  const handleDownload = async () => {
    try {
      if (!content.file_path) {
        toast.error('No file available for download');
        return;
      }
      
      const { data, error } = await supabase.storage
        .from('content')
        .download(content.file_path);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = content.title; // Use content title as filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      const { error: updateError } = await supabase
        .from('content')
        .update({ downloads: content.views + 1 })
        .eq('id', content.id);

      if (updateError) throw updateError;

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            {getIcon()}
            <div>
              <CardTitle className="text-lg">{content.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                by {content.author_name} · {formatDistanceToNow(new Date(content.date), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge variant={content.type === 'video' ? "destructive" : content.type === 'article' ? "default" : "outline"}>
            {content.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="text-sm mb-2">
          <Badge variant="outline" className="mr-2">{content.subject}</Badge>
        </div>
        
        {content.article_snippet && (
          <div className="mt-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className={`text-sm text-muted-foreground ${!isExpanded && 'line-clamp-2'}`}>
                {content.article_snippet}
              </p>
              <TextToSpeech text={content.article_snippet} />
            </div>
            {content.article_snippet.length > 120 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 h-6 px-2 text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {content.views}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" /> {content.rating}
          </span>
          {content.downloads !== undefined && (
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" /> {content.downloads}
            </span>
          )}
        </div>
        
        {content.file_path && (
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
