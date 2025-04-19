
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileIcon, Eye, Star, Download } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface ContentProps {
  id: string;
  title: string;
  type: string;
  subject: string;
  author_name: string;
  article_snippet?: string;
  file_path?: string | null;
  date: string;
  views: number;
  rating: number;
}

const ContentCard = ({ content }: { content: ContentProps }) => {
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
      if (!content.file_path) return;
      
      // Get public URL for the file
      const { data } = await fetch(`/api/get-content-url?path=${content.file_path}`).then(res => res.json());
      
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
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
            <p className={`text-sm text-muted-foreground ${!isExpanded && 'line-clamp-2'}`}>
              {content.article_snippet}
            </p>
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
