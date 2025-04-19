
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileVideo, File, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface ChapterMaterialViewerProps {
  material: any;
  onDelete: (id: string) => void;
}

const ChapterMaterialViewer = ({ material, onDelete }: ChapterMaterialViewerProps) => {
  if (!material) return null;

  // Handle file download
  const downloadFile = () => {
    if (material.url) {
      const link = document.createElement('a');
      link.href = material.url;
      link.target = '_blank';
      link.download = material.title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {material.type === 'text' && <FileText className="h-5 w-5 text-blue-500" />}
            {material.type === 'file' && <File className="h-5 w-5 text-green-500" />}
            {material.type === 'video' && <FileVideo className="h-5 w-5 text-red-500" />}
            <CardTitle className="text-base">{material.title}</CardTitle>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Delete</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-destructive"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this material from the chapter.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(material.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        {material.type === 'text' && (
          <div className="whitespace-pre-wrap text-sm">{material.content}</div>
        )}
        
        {material.type === 'file' && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Document</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" /> View
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFile} className="flex items-center gap-1">
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        )}
        
        {material.type === 'video' && (
          <div className="space-y-2">
            <div className="aspect-video rounded-md overflow-hidden bg-black">
              <video 
                src={material.url} 
                controls 
                className="w-full h-full"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterMaterialViewer;
