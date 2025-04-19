
import { FC } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Video, Link as LinkIcon, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentCardProps {
  id: string;
  title: string;
  type: string;
  url?: string;
  createdAt: Date;
}

const ContentCard: FC<ContentCardProps> = ({ id, title, type, url, createdAt }) => {
  const getIcon = () => {
    switch (type) {
      case "article":
        return <FileText className="h-6 w-6 text-blue-500" />;
      case "video":
        return <Video className="h-6 w-6 text-red-500" />;
      case "link":
        return <LinkIcon className="h-6 w-6 text-green-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle className="text-lg truncate">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          Type: {type.charAt(0).toUpperCase() + type.slice(1)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Added on {createdAt.toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter>
        {url ? (
          <Button variant="outline" size="sm" asChild className="w-full">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open Resource
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
