
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video, Calendar } from 'lucide-react';
import { useIsInstructor } from '@/hooks/useIsInstructor';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useScheduledMeetings } from '@/hooks/useScheduledMeetings';

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export const CreateMeetingButton = ({ 
  variant = "outline" as ButtonVariant, 
  showText = true, 
  className = "" 
}) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isInstructor = useIsInstructor();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createMeeting } = useScheduledMeetings();

  const createInstantMeeting = async () => {
    try {
      setIsLoading(true);
      
      if (!isInstructor) {
        toast.error('Only instructors can create meetings');
        return;
      }
      
      if (!user) {
        toast.error('You need to be logged in to create a meeting');
        return;
      }
      
      const roomId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      console.log('Creating instant meeting with room ID:', roomId);
      
      navigate(`/meeting/${roomId}`);
    } catch (error: any) {
      console.error('Meeting creation error:', error);
      toast.error(`Failed to create meeting: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (!user || !profile) {
        toast.error('You need to be logged in to schedule a meeting');
        return;
      }
      
      if (!meetingTitle || !meetingDate || !meetingTime) {
        toast.error('Please fill in all fields');
        return;
      }

      const roomId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      await createMeeting.mutateAsync({
        title: meetingTitle,
        scheduledDate: meetingDate,
        scheduledTime: meetingTime,
        roomId
      });
      
      toast.success(`Meeting "${meetingTitle}" scheduled for ${meetingDate} at ${meetingTime}`);
      setIsDialogOpen(false);
      
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingTime('');
    } catch (error: any) {
      console.error('Meeting scheduling error:', error);
      toast.error(`Failed to schedule meeting: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInstructor) return null;

  return (
    <>
      <Button 
        variant={variant} 
        onClick={createInstantMeeting} 
        className={`gap-2 ${className}`}
        disabled={isLoading}
      >
        <Video className="h-4 w-4" />
        {showText && (isLoading ? "Creating..." : "Create Meeting")}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 ml-2"
            disabled={isLoading}
          >
            <Calendar className="h-4 w-4" />
            {showText && "Schedule Meeting"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a New Meeting</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={scheduleMeeting} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Weekly Team Meeting"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Scheduling..." : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
