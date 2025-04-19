
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileVideo, Link as LinkIcon, PenLine, Trash, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';

export interface ChapterMaterialViewerProps {
  material: any;
  onDelete?: (id: string) => void;
}

export default function ChapterMaterialViewer({ material, onDelete }: ChapterMaterialViewerProps) {
  const { user } = useAuth();
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submission, setSubmission] = useState<any>(material.submissions?.[0] || null);
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [marksObtained, setMarksObtained] = useState<number | ''>(submission?.marks_obtained || '');
  const [isGrading, setIsGrading] = useState(false);
  
  const isAssignment = material.is_assignment;
  const hasSubmissionDeadline = isAssignment && material.assignment && material.assignment.deadline;
  const deadlineDate = hasSubmissionDeadline ? new Date(material.assignment.deadline) : null;
  const deadlinePassed = deadlineDate ? new Date() > deadlineDate : false;
  
  const renderTypeIcon = () => {
    switch (material.type) {
      case 'text':
        return <PenLine className="h-5 w-5" />;
      case 'file':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <FileVideo className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleSubmissionUpload = async () => {
    if (!user) return;
    if (!submissionFile && !submissionContent) {
      toast.error('Please provide a submission');
      return;
    }

    try {
      setUploading(true);
      let submissionUrl = null;

      if (submissionFile) {
        const fileExt = submissionFile.name.split('.').pop();
        const fileName = `${material.id}-${uuidv4()}.${fileExt}`;
        const filePath = `submissions/${fileName}`;

        const { error: uploadError } = await supabase
          .storage
          .from('course-materials')
          .upload(filePath, submissionFile, {
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
          .storage
          .from('course-materials')
          .getPublicUrl(filePath);

        submissionUrl = publicUrl;
      }

      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: material.assignment.id,
          student_id: user.id,
          submission_content: submissionContent || null,
          submission_url: submissionUrl
        });

      if (submissionError) throw submissionError;

      toast.success('Submission uploaded successfully');
      
      // Fetch the updated submission
      const { data: submissionData, error: fetchError } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', material.assignment.id)
        .eq('student_id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      setSubmission(submissionData);
      setSubmissionFile(null);
      setSubmissionContent('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!submission) return;
    
    try {
      setIsGrading(true);
      
      const { error } = await supabase
        .from('submissions')
        .update({
          feedback,
          marks_obtained: marksObtained,
          graded_at: new Date().toISOString()
        })
        .eq('id', submission.id);
      
      if (error) throw error;
      
      toast.success('Submission graded successfully');
      
      // Update local state
      setSubmission({
        ...submission,
        feedback,
        marks_obtained: marksObtained,
        graded_at: new Date().toISOString()
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {renderTypeIcon()}
            <CardTitle>{material.title}</CardTitle>
          </div>
          {material.chapter && (
            <CardDescription>
              Chapter: {material.chapter.title}
            </CardDescription>
          )}
        </div>
        {onDelete && (
          <Button
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(material.id)}
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {material.type === 'text' && material.content && (
          <div className="prose prose-sm max-w-none">
            <p>{material.content}</p>
          </div>
        )}
        
        {(material.type === 'file' || material.type === 'video') && material.url && (
          <div>
            <a 
              href={material.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              Open {material.type === 'file' ? 'document' : 'video'}
            </a>
          </div>
        )}
        
        {isAssignment && hasSubmissionDeadline && (
          <div className="text-sm">
            <span className={`font-semibold ${deadlinePassed ? 'text-destructive' : 'text-orange-500'}`}>
              Deadline: {format(deadlineDate!, 'PPpp')}
            </span>
            {deadlinePassed && (
              <span className="ml-2 text-destructive">(Passed)</span>
            )}
          </div>
        )}

        {isAssignment && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Assignment Details</h4>
            {material.assignment.description && (
              <p className="text-sm mb-4">{material.assignment.description}</p>
            )}
            <div className="text-sm">
              <span className="font-medium">Total Marks:</span> {material.assignment.total_marks}
            </div>
          </div>
        )}
        
        {isAssignment && submission && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Your Submission</h4>
            <div className="text-sm">
              <p>
                <span className="font-medium">Submitted:</span> {format(new Date(submission.submitted_at), 'PPpp')}
              </p>
              
              {submission.submission_content && (
                <div className="mt-2">
                  <h5 className="font-medium text-xs mb-1">Content:</h5>
                  <p className="bg-muted p-2 rounded text-xs">{submission.submission_content}</p>
                </div>
              )}
              
              {submission.submission_url && (
                <div className="mt-2">
                  <a 
                    href={submission.submission_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <LinkIcon className="h-3 w-3" />
                    View submission file
                  </a>
                </div>
              )}
              
              {submission.marks_obtained !== null && (
                <div className="mt-2">
                  <p>
                    <span className="font-medium">Grade:</span> {submission.marks_obtained}/{material.assignment.total_marks}
                  </p>
                </div>
              )}
              
              {submission.feedback && (
                <div className="mt-2">
                  <h5 className="font-medium text-xs mb-1">Feedback:</h5>
                  <p className="bg-muted p-2 rounded text-xs">{submission.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {isAssignment && !submission && !deadlinePassed && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Submit Your Work</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-1">Text Submission (Optional)</h5>
                <textarea
                  className="w-full p-2 border rounded-md resize-y min-h-[100px] text-sm"
                  placeholder="Enter your submission here..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                ></textarea>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-1">File Upload (Optional)</h5>
                <div className="border rounded-md p-4">
                  {submissionFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span className="text-sm truncate max-w-[200px]">{submissionFile.name}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSubmissionFile(null)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSubmissionFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="submission-upload"
                      />
                      <label htmlFor="submission-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center py-4">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload a document
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleSubmissionUpload} 
                disabled={uploading || (!submissionContent && !submissionFile)}
              >
                {uploading ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          </div>
        )}
        
        {isAssignment && submission && user?.id !== submission.student_id && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Grade Submission</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Marks (out of {material.assignment.total_marks})</label>
                <Input
                  type="number"
                  min={0}
                  max={material.assignment.total_marks}
                  value={marksObtained}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMarksObtained(val === '' ? '' : Number(val));
                  }}
                  className="max-w-[100px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Feedback</label>
                <textarea
                  className="w-full p-2 border rounded-md resize-y min-h-[100px] text-sm"
                  placeholder="Provide feedback to the student..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>
              
              <Button 
                onClick={handleGradeSubmission} 
                disabled={isGrading || marksObtained === ''}
              >
                {isGrading ? 'Saving...' : 'Save Grade'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Added on {format(new Date(material.created_at), 'PPP')}
      </CardFooter>
    </Card>
  );
}
