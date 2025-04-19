
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

export const CreateMeetingButton = ({ 
  variant = "outline", 
  showText = true, 
  className = "" 
}) => {
  const navigate = useNavigate();
  const isInstructor = useIsInstructor();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const createInstantMeeting = () => {
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

  const scheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!meetingTitle || !meetingDate || !meetingTime) {
        toast.error('Please fill in all fields');
        return;
      }
      
      // In a production app, you'd save this to a database
      // For demo purposes, just show a success message
      toast.success(`Meeting "${meetingTitle}" scheduled for ${meetingDate} at ${meetingTime}`);
      setIsDialogOpen(false);
      
      // Reset form
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingTime('');
    } catch (error: any) {
      toast.error('Failed to schedule meeting');
      console.error('Meeting scheduling error:', error);
    }
  };

  if (!isInstructor) return null;

  return (
    <>
      <Button 
        variant={variant} 
        onClick={createInstantMeeting} 
        className={`gap-2 ${className}`}
      >
        <Video className="h-4 w-4" />
        {showText && "Create Meeting"}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 ml-2">
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
              <Button type="submit">Schedule Meeting</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
