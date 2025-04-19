
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useIsInstructor } from '@/hooks/useIsInstructor';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const VideoMeetingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInstructor = useIsInstructor();

  useEffect(() => {
    const initializeZegoCloud = async () => {
      try {
        if (!roomId || !profile) {
          throw new Error('Missing required information');
        }

        console.log('Initializing meeting room:', roomId);
        
        // Generate token using our edge function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-zego-token', {
          body: {
            roomId,
            userId: profile.id,
            userName: profile.full_name || 'Anonymous'
          },
        });

        if (tokenError) {
          console.error('Token generation error:', tokenError);
          throw new Error(`Failed to get token: ${tokenError.message}`);
        }

        if (!tokenData?.token) {
          console.error('No token returned:', tokenData);
          throw new Error('Failed to get a valid token');
        }

        console.log('Token generated successfully');
        
        // Create Zego instance with the token
        const zp = ZegoUIKitPrebuilt.create(tokenData.token);
        
        // Mount the Zego component
        const element = document.getElementById('zego-container');
        if (element) {
          zp.joinRoom({
            container: element,
            scenario: {
              mode: ZegoUIKitPrebuilt.GroupCall,
            },
            showTurnOffRemoteCameraButton: true,
            showTurnOffRemoteMicrophoneButton: true,
            showRemoveUserButton: isInstructor,
            onLeaveRoom: () => {
              navigate(-1);
            },
          });
          console.log('Successfully joined the meeting room');
        } else {
          throw new Error('Container element not found');
        }
        setIsLoading(false);
      } catch (error: any) {
        console.error('Zego initialization error:', error);
        setError(error.message || 'Failed to join meeting');
        setIsLoading(false);
        toast.error(error.message || 'Failed to join meeting');
      }
    };

    initializeZegoCloud();
  }, [roomId, profile, navigate, isInstructor]);

  if (!roomId) {
    return <div>Error: No room ID provided</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6">
        <Card className="p-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Video Meeting</h2>
            <p className="text-muted-foreground">Room ID: {roomId}</p>
          </div>
          <div id="zego-container" className="w-full aspect-video bg-muted">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <p>Loading meeting room...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-destructive text-center mb-2">Error: {error}</p>
                <p className="text-sm text-muted-foreground">
                  This could be due to incorrect credentials or a connection issue.
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default VideoMeetingPage;
