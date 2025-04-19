import React, { useState } from 'react';
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
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ChapterMaterialViewerProps {
  material: any;
  onDelete: (id: string) => void;
}

const ChapterMaterialViewer = ({ material, onDelete }: ChapterMaterialViewerProps) => {
  const { user } = useAuth();
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [grade, setGrade] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  const { data: assignment } = useQuery({
    queryKey: ['assignment', material.id],
    queryFn: async () => {
      if (!material.is_assignment) return null;
      const { data, error } = await supabase
        .from('assignments')
        .select('*, submissions(*)')
        .eq('material_id', material.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!material.is_assignment
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    try {
      let submissionUrl = null;
      
      if (submissionFile) {
        const fileExt = submissionFile.name.split('.').pop();
        const fileName = `${assignment.id}/${user?.id}/${Math.random().toString(36).slice(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('submissions')
          .upload(fileName, submissionFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
          .storage
          .from('submissions')
          .getPublicUrl(fileName);

        submissionUrl = publicUrl;
      }

      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignment.id,
          student_id: user?.id,
          submission_content: submissionContent,
          submission_url: submissionUrl
        });

      if (submissionError) throw submissionError;
      
      toast.success('Submission added successfully');
      setSubmissionContent('');
      setSubmissionFile(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGrade = async () => {
    if (!assignment) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          marks_obtained: grade,
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('assignment_id', assignment.id)
        .eq('student_id', user?.id);

      if (error) throw error;
      
      toast.success('Submission graded successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

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
        {material.is_assignment && assignment && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Assignment Details</h4>
                <p className="text-sm text-muted-foreground">
                  Due: {format(new Date(assignment.deadline), 'PPP h:mm a')}
                </p>
                <p className="text-sm">Total Marks: {assignment.total_marks}</p>
              </div>
            </div>

            {user && assignment.submissions?.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium">Your Submission</h4>
                {assignment.submissions.map((submission: any) => (
                  <div key={submission.id} className="space-y-2">
                    {submission.submission_content && (
                      <p className="text-sm">{submission.submission_content}</p>
                    )}
                    {submission.submission_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                          View Submission
                        </a>
                      </Button>
                    )}
                    {submission.marks_obtained && (
                      <div className="text-sm">
                        <p>Grade: {submission.marks_obtained}/{assignment.total_marks}</p>
                        {submission.feedback && (
                          <p className="mt-1">Feedback: {submission.feedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Submission Text</label>
                  <Textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Enter your submission text..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload File</label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSubmissionFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <Button type="submit">Submit Assignment</Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterMaterialViewer;
