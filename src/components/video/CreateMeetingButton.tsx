
import React, { useState, useEffect } from 'react';
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

// Define the valid button variant types
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

// Define a type for scheduled meetings
type ScheduledMeeting = {
  id: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  roomId: string;
  createdBy: string;
  createdByName: string;
};

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
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([]);

  // Load meetings from localStorage on component mount
  useEffect(() => {
    const storedMeetings = localStorage.getItem('scheduledMeetings');
    if (storedMeetings) {
      try {
        setScheduledMeetings(JSON.parse(storedMeetings));
      } catch (e) {
        console.error('Error parsing stored meetings:', e);
      }
    }
  }, []);

  const createInstantMeeting = () => {
    try {
      if (!isInstructor) {
        toast.error('Only instructors can create meetings');
        return;
      }
      
      if (!user) {
        toast.error('You need to be logged in to create a meeting');
        return;
      }
      
      // Generate a unique room ID
      const roomId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      console.log('Creating instant meeting with room ID:', roomId);
      
      // Navigate to the meeting room
      navigate(`/meeting/${roomId}`);
    } catch (error: any) {
      toast.error('Failed to create meeting');
      console.error('Meeting creation error:', error);
    }
  };

  const scheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user || !profile) {
        toast.error('You need to be logged in to schedule a meeting');
        return;
      }
      
      if (!meetingTitle || !meetingDate || !meetingTime) {
        toast.error('Please fill in all fields');
        return;
      }
      
      // Generate a unique room ID for the scheduled meeting
      const roomId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Create new meeting object
      const newMeeting: ScheduledMeeting = {
        id: `meeting-${Date.now()}`,
        title: meetingTitle,
        scheduledDate: meetingDate,
        scheduledTime: meetingTime,
        roomId: roomId,
        createdBy: user.id,
        createdByName: profile.full_name || user.email || 'Anonymous'
      };
      
      // Add to local state
      const updatedMeetings = [...scheduledMeetings, newMeeting];
      setScheduledMeetings(updatedMeetings);
      
      // Store in localStorage
      localStorage.setItem('scheduledMeetings', JSON.stringify(updatedMeetings));
      
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
