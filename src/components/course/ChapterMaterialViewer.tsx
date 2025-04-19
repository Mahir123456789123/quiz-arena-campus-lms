
// We need to fix the submission marks input to ensure it always provides a valid number
// This requires a function to safely convert input values to numbers and avoid empty strings

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';

interface ChapterMaterialViewerProps {
  material: any;
  isInstructor?: boolean;
}

const ChapterMaterialViewer = ({ material, isInstructor = false }: ChapterMaterialViewerProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [marksObtained, setMarksObtained] = useState<number>(0);

  useEffect(() => {
    if (material.is_assignment) {
      fetchAssignmentDetails();
    }
  }, [material]);

  const fetchAssignmentDetails = async () => {
    try {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select('*, submissions(*)')
        .eq('material_id', material.id)
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

      // Get all submissions for instructors, or just the current user's submission for students
      const query = supabase
        .from('submissions')
        .select('*, student:profiles(full_name)')
        .eq('assignment_id', assignmentData.id);

      if (!isInstructor) {
        query.eq('student_id', user?.id);
      }

      const { data: submissionsData, error: submissionsError } = await query;
      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);
    } catch (error: any) {
      console.error('Failed to fetch assignment details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    setLoading(true);
    try {
      let submissionUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${assignment.id}-${user?.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `submissions/${fileName}`;

        const { error: uploadError } = await supabase
          .storage
          .from('course-submissions')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase
          .storage
          .from('course-submissions')
          .getPublicUrl(filePath);

        submissionUrl = data.publicUrl;
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

      toast.success('Assignment submitted successfully');
      fetchAssignmentDetails();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    setLoading(true);
    try {
      // Ensure marksObtained is a valid number before submitting
      const numericMarks = Number(marksObtained) || 0;
      
      const { error } = await supabase
        .from('submissions')
        .update({
          marks_obtained: numericMarks,
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Submission graded successfully');
      fetchAssignmentDetails();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (material.type) {
      case 'text':
        return <div className="prose max-w-none">{material.content}</div>;
      case 'file':
        return (
          <div className="flex flex-col items-center justify-center py-4">
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-2"
            >
              <span>View Document</span>
            </a>
          </div>
        );
      case 'video':
        return (
          <div className="relative aspect-video">
            <video
              src={material.url}
              controls
              className="absolute inset-0 w-full h-full"
            />
          </div>
        );
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium">{material.title}</h3>
          {renderContent()}
        </div>

        {material.is_assignment && assignment && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex flex-col space-y-2">
              <h4 className="font-medium">Assignment Details</h4>
              <p className="text-sm">Due: {format(new Date(assignment.deadline), 'PPPp')}</p>
              <p className="text-sm">Total Marks: {assignment.total_marks}</p>
              {assignment.description && (
                <div className="mt-2">
                  <h5 className="text-sm font-medium">Instructions:</h5>
                  <p className="text-sm">{assignment.description}</p>
                </div>
              )}
            </div>

            {/* Student Submission Form */}
            {!isInstructor && submissions.length === 0 && (
              <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Answer</label>
                  <Textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Write your answer here..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload File (Optional)</label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </form>
            )}

            {/* Student's own submission view */}
            {!isInstructor && submissions.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Your Submission</h4>
                {submissions.map((submission) => (
                  <div key={submission.id} className="space-y-2 bg-muted/50 p-4 rounded-md">
                    <p className="text-sm">
                      Submitted on: {format(new Date(submission.submitted_at), 'PPPp')}
                    </p>
                    {submission.submission_content && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium">Your Answer:</h5>
                        <p className="text-sm whitespace-pre-wrap">{submission.submission_content}</p>
                      </div>
                    )}
                    {submission.submission_url && (
                      <a
                        href={submission.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm block mt-2"
                      >
                        View Attached File
                      </a>
                    )}
                    {submission.graded_at && (
                      <div className="mt-4 border-t pt-2">
                        <h5 className="text-sm font-medium">Feedback:</h5>
                        <p className="text-sm whitespace-pre-wrap">{submission.feedback}</p>
                        <p className="text-sm font-medium mt-2">
                          Marks: {submission.marks_obtained} / {assignment.total_marks}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Instructor view of all submissions */}
            {isInstructor && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Student Submissions</h4>
                {submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No submissions yet.</p>
                ) : (
                  <div className="space-y-6">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="space-y-3 bg-muted/50 p-4 rounded-md">
                        <div className="flex justify-between">
                          <h5 className="font-medium">{submission.student.full_name}</h5>
                          <p className="text-sm">
                            Submitted: {format(new Date(submission.submitted_at), 'PPPp')}
                          </p>
                        </div>
                        
                        {submission.submission_content && (
                          <div>
                            <h6 className="text-sm font-medium">Answer:</h6>
                            <p className="text-sm whitespace-pre-wrap bg-background p-2 rounded">
                              {submission.submission_content}
                            </p>
                          </div>
                        )}
                        
                        {submission.submission_url && (
                          <a
                            href={submission.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm block"
                          >
                            View Attached File
                          </a>
                        )}

                        {!submission.graded_at ? (
                          <div className="border-t pt-3 mt-3 space-y-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Feedback</label>
                              <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide feedback to the student..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Marks (out of {assignment.total_marks})
                              </label>
                              <Input
                                type="number"
                                value={marksObtained}
                                onChange={(e) => {
                                  // Convert to number and handle empty string case
                                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                                  setMarksObtained(value);
                                }}
                                min={0}
                                max={assignment.total_marks}
                              />
                            </div>
                            
                            <Button 
                              onClick={() => handleGradeSubmission(submission.id)}
                              disabled={loading}
                            >
                              {loading ? 'Saving...' : 'Submit Grade'}
                            </Button>
                          </div>
                        ) : (
                          <div className="border-t pt-3 mt-3">
                            <h6 className="text-sm font-medium">Feedback:</h6>
                            <p className="text-sm whitespace-pre-wrap">{submission.feedback}</p>
                            <p className="text-sm font-medium mt-2">
                              Marks: {submission.marks_obtained} / {assignment.total_marks}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Graded on: {format(new Date(submission.graded_at), 'PPPp')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterMaterialViewer;
