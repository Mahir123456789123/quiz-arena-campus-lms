
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export const useScheduledMeetings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['scheduled-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_meetings')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const createMeeting = useMutation({
    mutationFn: async ({ title, scheduledDate, scheduledTime, roomId }: {
      title: string;
      scheduledDate: string;
      scheduledTime: string;
      roomId: string;
    }) => {
      const { error } = await supabase
        .from('scheduled_meetings')
        .insert({
          title,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          room_id: roomId,
          created_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-meetings'] });
    }
  });

  return {
    meetings,
    isLoading,
    createMeeting
  };
};
