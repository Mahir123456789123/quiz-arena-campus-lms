
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ScheduledMeeting } from '@/hooks/useScheduledMeetings';

interface UpcomingMeetingsProps {
  meetings: ScheduledMeeting[];
  isLoading: boolean;
}

export const UpcomingMeetings = ({ meetings, isLoading }: UpcomingMeetingsProps) => {
  const navigate = useNavigate();

  const formatDateTime = (date: string, time: string) => {
    const formattedDate = new Date(date).toLocaleDateString();
    return `${formattedDate} at ${time}`;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming Meetings
        </CardTitle>
        <CardDescription>Manage your scheduled video meetings</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center">
            <span className="text-muted-foreground">Loading meetings...</span>
          </div>
        ) : meetings.length > 0 ? (
          <div className="space-y-4">
            {meetings.map(meeting => (
              <div key={meeting.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">{meeting.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(meeting.scheduled_date, meeting.scheduled_time)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/meeting/${meeting.room_id}`)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(meeting.room_id);
                      toast.success('Meeting code copied to clipboard');
                    }}
                  >
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground">No upcoming meetings scheduled</div>
        )}
      </CardContent>
    </Card>
  );
};
