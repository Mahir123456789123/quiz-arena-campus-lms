
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Video, Link as LinkIcon, Newspaper, X } from "lucide-react";

interface ContentFiltersProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

const ContentFilters: FC<ContentFiltersProps> = ({ selectedType, onTypeChange }) => {
  const handleTypeClick = (type: string) => {
    if (selectedType === type) {
      onTypeChange(null);
    } else {
      onTypeChange(type);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Filter by Type</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedType === "article" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTypeClick("article")}
            className={selectedType === "article" ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            <FileText className="mr-1 h-4 w-4" /> Articles
          </Button>
          <Button 
            variant={selectedType === "video" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTypeClick("video")}
            className={selectedType === "video" ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <Video className="mr-1 h-4 w-4" /> Videos
          </Button>
          <Button 
            variant={selectedType === "document" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTypeClick("document")}
            className={selectedType === "document" ? "bg-amber-500 hover:bg-amber-600" : ""}
          >
            <Newspaper className="mr-1 h-4 w-4" /> Documents
          </Button>
          <Button 
            variant={selectedType === "link" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleTypeClick("link")}
            className={selectedType === "link" ? "bg-green-500 hover:bg-green-600" : ""}
          >
            <LinkIcon className="mr-1 h-4 w-4" /> Links
          </Button>
        </div>
        
        {selectedType && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTypeChange(null)}
            className="mt-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" /> Clear Filter
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContentFilters;
