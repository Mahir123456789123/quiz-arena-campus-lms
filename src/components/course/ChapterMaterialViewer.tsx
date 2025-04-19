
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileVideo, File, AlertCircle, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';

export interface ChapterMaterialViewerProps {
  material: any;
  onDelete?: (id: string) => void;
}

const ChapterMaterialViewer = ({ material, onDelete }: ChapterMaterialViewerProps) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [marks, setMarks] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  // Fetch assignment information if this material is an assignment
  const { data: assignmentData, isLoading: loadingAssignment } = useQuery({
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
    enabled: material.is_assignment
  });

  // Get user submission if available
  const userSubmission = assignmentData?.submissions?.find(
    (sub: any) => sub.student_id === user?.id
  );

  // Format the title based on material type
  const formatTitle = () => {
    let icon = <FileText className="h-5 w-5" />;
    if (material.type === 'video') {
      icon = <FileVideo className="h-5 w-5" />;
    } else if (material.type === 'file') {
      icon = <File className="h-5 w-5" />;
    }

    return (
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex-1">
          <h3 className="font-medium">{material.title}</h3>
          {material.is_assignment && assignmentData && (
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4" />
              <span>
                Due: {format(new Date(assignmentData.deadline), 'PPP p')} 
                {assignmentData.total_marks && ` • ${assignmentData.total_marks} marks`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentData || !user) return;
    
    setSubmitting(true);
    try {
      let submissionUrl = null;
      
      // Upload file if provided
      if (submissionFile) {
        const fileExt = submissionFile.name.split('.').pop();
        const fileName = `${assignmentData.id}-${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `submissions/${fileName}`;
        
        // Upload with progress
        const { error } = await supabase.storage
          .from('course-materials')
          .upload(filePath, submissionFile, {
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100);
            },
          });
          
        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('course-materials')
          .getPublicUrl(filePath);
          
        submissionUrl = publicUrl;
      }
      
      // Create submission record
      const { error } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentData.id,
          student_id: user.id,
          submission_content: submissionContent || null,
          submission_url: submissionUrl,
        });
        
      if (error) throw error;
      
      toast.success('Assignment submitted successfully');
      // Force query refetch
      window.location.reload();
    } catch (error: any) {
      toast.error(`Error submitting assignment: ${error.message}`);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    if (!marks) {
      toast.error('Please enter a valid mark');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          marks_obtained: Number(marks),
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);
        
      if (error) throw error;
      
      toast.success('Submission graded successfully');
      setGrading(false);
      // Force query refetch
      window.location.reload();
    } catch (error: any) {
      toast.error(`Error grading submission: ${error.message}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {formatTitle()}
        
        {/* Material content based on type */}
        <div className="mt-3">
          {material.type === 'text' && material.content && (
            <div className="text-sm mt-2">
              <p>{material.content}</p>
            </div>
          )}
          
          {material.type === 'file' && material.url && (
            <div className="mt-2">
              <a 
                href={material.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <File className="h-4 w-4" />
                Download Document
              </a>
            </div>
          )}
          
          {material.type === 'video' && material.url && (
            <div className="mt-2">
              <video 
                controls 
                className="w-full rounded-md" 
                src={material.url}>
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        
        {/* Assignment submission section */}
        {material.is_assignment && assignmentData && user && (
          <div className="mt-4 pt-4 border-t">
            {/* Show submission if already submitted */}
            {userSubmission ? (
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                  <span>Submitted on {format(new Date(userSubmission.submitted_at), 'PPP p')}</span>
                </div>
                
                {userSubmission.submission_content && (
                  <div className="text-sm border p-3 rounded-md">
                    {userSubmission.submission_content}
                  </div>
                )}
                
                {userSubmission.submission_url && (
                  <div className="text-sm">
                    <a 
                      href={userSubmission.submission_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <File className="h-4 w-4" />
                      View Submitted File
                    </a>
                  </div>
                )}
                
                {/* Show grade if graded */}
                {userSubmission.marks_obtained !== null && (
                  <div className="text-sm bg-muted p-3 rounded-md">
                    <div className="font-medium">
                      Grade: {userSubmission.marks_obtained} / {assignmentData.total_marks}
                    </div>
                    {userSubmission.feedback && (
                      <div className="mt-2">
                        <div className="font-medium">Feedback:</div>
                        <div className="mt-1">{userSubmission.feedback}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Submission form
              <form onSubmit={handleSubmitAssignment} className="space-y-3">
                <h4 className="text-sm font-medium">Submit Your Assignment</h4>
                
                <Textarea
                  placeholder="Enter your assignment text here..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Or upload a file</label>
                  <div className="border rounded-md p-3">
                    {submissionFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="h-5 w-5" />
                          <span className="text-sm truncate max-w-[200px]">{submissionFile.name}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSubmissionFile(null)}
                        >
                          <Trash2 className="h-4 w-4" />
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
                          id="submission-file"
                        />
                        <label htmlFor="submission-file" className="cursor-pointer">
                          <div className="flex flex-col items-center justify-center py-4">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload file
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="h-2" />
                )}
                
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </form>
            )}
          </div>
        )}
        
        {/* Instructor grading section */}
        {material.is_assignment && assignmentData?.submissions?.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Student Submissions</h4>
            <div className="space-y-3">
              {assignmentData.submissions.map((submission: any) => (
                <Card key={submission.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">Student ID: {submission.student_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {format(new Date(submission.submitted_at), 'PPP p')}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setGrading(true);
                        setMarks(submission.marks_obtained || '');
                        setFeedback(submission.feedback || '');
                      }}
                    >
                      {submission.marks_obtained !== null ? 'Update Grade' : 'Grade'}
                    </Button>
                  </div>
                  
                  {submission.submission_content && (
                    <div className="mt-2 text-sm border p-3 rounded-md">
                      {submission.submission_content}
                    </div>
                  )}
                  
                  {submission.submission_url && (
                    <div className="mt-2">
                      <a 
                        href={submission.submission_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <File className="h-4 w-4" />
                        View Submitted File
                      </a>
                    </div>
                  )}
                  
                  {/* Show current grade if graded */}
                  {submission.marks_obtained !== null && (
                    <div className="mt-2 text-sm">
                      <p><strong>Grade:</strong> {submission.marks_obtained} / {assignmentData.total_marks}</p>
                      {submission.feedback && (
                        <p><strong>Feedback:</strong> {submission.feedback}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Grading form */}
                  {grading && (
                    <div className="mt-3 space-y-3 bg-muted p-3 rounded-md">
                      <div>
                        <label className="text-sm font-medium block">Marks (out of {assignmentData.total_marks})</label>
                        <Input
                          type="number"
                          value={marks}
                          onChange={(e) => {
                            const value = e.target.value;
                            setMarks(value === '' ? '' : Number(value));
                          }}
                          min={0}
                          max={assignmentData.total_marks}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block">Feedback</label>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleGradeSubmission(submission.id)}
                        >
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setGrading(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Delete material button (for instructor only) */}
        {onDelete && (
          <div className="mt-4 pt-2 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this material.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(material.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterMaterialViewer;
