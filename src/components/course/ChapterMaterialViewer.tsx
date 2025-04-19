import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, FileVideo, Link as LinkIcon, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

interface ChapterMaterialViewerProps {
  material: any;
  onDelete?: (id: string) => void;
}

const ChapterMaterialViewer = ({ material, onDelete }: ChapterMaterialViewerProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const renderMaterialContent = () => {
    switch (material.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <p>{material.content}</p>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <a 
              href={material.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View Document</span>
              <LinkIcon className="h-4 w-4" />
            </a>
          </div>
        );
      case 'video':
        return (
          <div className="mt-4">
            <div className="relative pt-[56.25%]">
              <iframe
                src={material.url}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        );
      default:
        return <p>Unknown material type</p>;
    }
  };

  const handleTextSubmission = async () => {
    if (!submissionContent.trim()) {
      toast.error('Please enter your submission content');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .insert({
          assignment_id: material.id,
          student_id: user?.id,
          submission_content: submissionContent
        });

      if (error) throw error;
      toast.success('Assignment submitted successfully');
      setSubmissionContent('');
    } catch (error: any) {
      toast.error(error.message || 'Error submitting assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSubmission = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `assignments/${material.id}/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('course-materials')
        .upload(filePath, selectedFile, {
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('course-materials')
        .getPublicUrl(filePath);

      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: material.id,
          student_id: user?.id,
          submission_url: publicUrl
        });

      if (submissionError) throw submissionError;

      toast.success('Assignment submitted successfully');
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Error submitting assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{material.title}</CardTitle>
          {onDelete && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(material.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderMaterialContent()}

        {material.is_assignment && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Submit Assignment</h3>
            {material.type === 'text' ? (
              <div className="space-y-4">
                <Textarea 
                  placeholder="Type your submission here..." 
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={6}
                />
                <Button 
                  onClick={handleTextSubmission} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id={`file-upload-${material.id}`}
                  />
                  <label 
                    htmlFor={`file-upload-${material.id}`} 
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{selectedFile ? selectedFile.name : 'Select file'}</span>
                  </label>
                </div>
                <Button 
                  onClick={handleFileSubmission} 
                  disabled={isSubmitting || !selectedFile}
                >
                  {isSubmitting ? 'Uploading...' : 'Upload Submission'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterMaterialViewer;
