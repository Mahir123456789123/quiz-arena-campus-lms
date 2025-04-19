
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

export const CreateMeetingButton = () => {
  const navigate = useNavigate();

  const createMeeting = () => {
    const roomId = Math.floor(Math.random() * 10000000).toString();
    navigate(`/meeting/${roomId}`);
  };

  return (
    <Button onClick={createMeeting} className="gap-2">
      <Video className="h-4 w-4" />
      Create Meeting
    </Button>
  );
};
