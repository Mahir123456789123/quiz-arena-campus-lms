
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { useIsInstructor } from '@/hooks/useIsInstructor';
import { toast } from 'sonner';

export const CreateMeetingButton = () => {
  const navigate = useNavigate();
  const isInstructor = useIsInstructor();

  const createMeeting = () => {
    try {
      if (!isInstructor) {
        toast.error('Only instructors can create meetings');
        return;
      }
      const roomId = Math.floor(Math.random() * 10000000).toString();
      navigate(`/meeting/${roomId}`);
    } catch (error: any) {
      toast.error('Failed to create meeting');
      console.error('Meeting creation error:', error);
    }
  };

  if (!isInstructor) return null;

  return (
    <Button onClick={createMeeting} variant="outline" className="gap-2">
      <Video className="h-4 w-4" />
      Create Meeting
    </Button>
  );
};
