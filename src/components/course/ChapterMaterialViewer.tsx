
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileVideo, Download, Upload, Clock, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export interface ChapterMaterialViewerProps {
  material: any;
  onDelete?: (id: string) => void;
}

const ChapterMaterialViewer = ({ material, onDelete }: ChapterMaterialViewerProps) => {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [textSubmission, setTextSubmission] = useState('');
  const [marks, setMarks] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const isInstructor = profile?.role === 'instructor';
  const isStudent = profile?.role === 'student';

  const fetchSubmission = async () => {
    if (!user?.id || !material?.is_assignment) return;
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', material.assignment?.id)
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSubmission(data);
        setTextSubmission(data.submission_content || '');
      }
      
    } catch (error: any) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchSubmission();
  });

  const handleSubmitAssignment = async () => {
    if (!user?.id || !material?.is_assignment || (!file && !textSubmission.trim())) {
      toast.error('Please provide a submission file or text');
      return;
    }

    setSubmitting(true);
    try {
      let submissionUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${material.assignment.id}_${user.id}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `assignments/${fileName}`;

        // Remove the onUploadProgress property that's causing the error
        const { error: uploadError } = await supabase
          .storage
          .from('submissions')
          .upload(filePath, file, {
            cacheControl: '3600'
            // Removed onUploadProgress as it's not supported
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
          .storage
          .from('submissions')
          .getPublicUrl(filePath);

        submissionUrl = publicUrl;
      }

      const submissionData = {
        assignment_id: material.assignment.id,
        student_id: user.id,
        submission_content: textSubmission.trim() || null,
        submission_url: submissionUrl
      };

      if (submission) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from('submissions')
          .update(submissionData)
          .eq('id', submission.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new submission
        const { error: insertError } = await supabase
          .from('submissions')
          .insert(submissionData);
        
        if (insertError) throw insertError;
      }

      toast.success('Assignment submitted successfully');
      fetchSubmission();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!submission || marks === '') return;
    
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          marks_obtained: Number(marks),
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submission.id);
      
      if (error) throw error;
      
      toast.success('Submission graded successfully');
      fetchSubmission();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const renderMaterialContent = () => {
    switch (material.type) {
      case 'text':
        return <div className="prose max-w-none">{material.content}</div>;
      case 'file':
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Document: </span>
            <a 
              href={material.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              {material.title}
            </a>
            <Button size="sm" variant="ghost" asChild>
              <a href={material.url} download>
                <Download className="h-4 w-4 mr-1" />
                Download
              </a>
            </Button>
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileVideo className="h-5 w-5" />
              <span>Video: {material.title}</span>
            </div>
            <video 
              src={material.url} 
              controls 
              className="w-full rounded-md"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderAssignmentSubmission = () => {
    if (!material.is_assignment) return null;
    
    if (isInstructor) {
      return (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Assignment Submissions</h3>
          {/* Instructor could view all submissions here */}
        </div>
      );
    }
    
    if (!isStudent) return null;
    
    const deadline = material.assignment ? new Date(material.assignment.deadline) : null;
    const isPastDeadline = deadline ? new Date() > deadline : false;
    
    return (
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-orange-500" />
          <span>
            Deadline: {deadline ? format(deadline, 'PPpp') : 'No deadline set'}
          </span>
          {isPastDeadline && (
            <span className="text-red-500 text-sm font-medium">Past due</span>
          )}
        </div>
        
        {submission ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span>Submitted on {format(new Date(submission.submitted_at), 'PPpp')}</span>
            </div>
            
            {submission.submission_url && (
              <div>
                <a 
                  href={submission.submission_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  View Submission File
                </a>
              </div>
            )}
            
            {submission.submission_content && (
              <div className="border p-3 rounded-md bg-gray-50">
                <h4 className="font-medium mb-1">Text Submission:</h4>
                <p>{submission.submission_content}</p>
              </div>
            )}
            
            {submission.graded_at && (
              <div className="border p-3 rounded-md bg-blue-50">
                <h4 className="font-medium mb-1">Grade:</h4>
                <p>Marks: {submission.marks_obtained} / {material.assignment.total_marks}</p>
                {submission.feedback && (
                  <>
                    <h4 className="font-medium mt-2 mb-1">Feedback:</h4>
                    <p>{submission.feedback}</p>
                  </>
                )}
              </div>
            )}
            
            {!isPastDeadline && !submission.graded_at && (
              <div className="space-y-3">
                <h4 className="font-medium">Update your submission:</h4>
                <Textarea
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Enter your text submission here..."
                  rows={4}
                />
                <div>
                  <input
                    type="file"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    className="hidden"
                    id="submission-file"
                  />
                  <label htmlFor="submission-file" className="cursor-pointer">
                    <div className="flex items-center gap-2 border rounded-md p-2 bg-gray-50 hover:bg-gray-100 w-fit">
                      <Upload className="h-4 w-4" />
                      <span>{file ? file.name : 'Upload new file'}</span>
                    </div>
                  </label>
                </div>
                <Button onClick={handleSubmitAssignment} disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Submission'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium">Submit your assignment:</h4>
            <Textarea
              value={textSubmission}
              onChange={(e) => setTextSubmission(e.target.value)}
              placeholder="Enter your text submission here..."
              rows={4}
            />
            <div>
              <input
                type="file"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="hidden"
                id="submission-file"
              />
              <label htmlFor="submission-file" className="cursor-pointer">
                <div className="flex items-center gap-2 border rounded-md p-2 bg-gray-50 hover:bg-gray-100 w-fit">
                  <Upload className="h-4 w-4" />
                  <span>{file ? file.name : 'Upload file'}</span>
                </div>
              </label>
            </div>
            <Button onClick={handleSubmitAssignment} disabled={submitting || isPastDeadline}>
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
            {isPastDeadline && (
              <p className="text-red-500 text-sm">
                Submission deadline has passed and new submissions are not accepted.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderGradingForm = () => {
    if (!isInstructor || !submission || !material.is_assignment) return null;
    
    return (
      <div className="mt-4 border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Grade Submission</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Marks (out of {material.assignment.total_marks})
            </label>
            <Input
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              max={material.assignment.total_marks}
              min={0}
              placeholder="Enter marks"
              className="w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Feedback</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback for student"
              rows={3}
            />
          </div>
          <Button onClick={handleGradeSubmission}>
            Submit Grade
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{material.title}</span>
          {onDelete && isInstructor && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(material.id)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        {material.is_assignment && (
          <CardDescription>
            Assignment • Due {material.assignment && format(new Date(material.assignment.deadline), 'PPp')}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {renderMaterialContent()}
        {renderAssignmentSubmission()}
        {renderGradingForm()}
      </CardContent>
    </Card>
  );
};

export default ChapterMaterialViewer;
