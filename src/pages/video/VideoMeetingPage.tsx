
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useIsInstructor } from '@/hooks/useIsInstructor';

const VideoMeetingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const isInstructor = useIsInstructor();

  useEffect(() => {
    const initializeZegoCloud = async () => {
      try {
        if (!roomId || !profile) {
          throw new Error('Missing required information');
        }

        // Use mock token for development until edge function is fixed
        // This is a temporary solution to get past the token error
        const appID = 1234567890; // Replace with your actual app ID when available
        const serverSecret = "your-server-secret"; // Replace with your actual server secret when available
        
        // Generate a simple token - this should be replaced with proper token generation in production
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          profile.id,
          profile.full_name || 'Anonymous'
        );
        
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        
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
            onLeaveRoom: () => {
              navigate(-1);
            },
          });
        }
        setIsLoading(false);
      } catch (error: any) {
        console.error('Zego initialization error:', error);
        toast.error(error.message || 'Failed to join meeting');
        navigate(-1);
      }
    };

    initializeZegoCloud();
  }, [roomId, profile, navigate]);

  if (!roomId) {
    return <div>Error: No room ID provided</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6">
        <Card className="p-4">
          <div id="zego-container" className="w-full aspect-video bg-muted">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <p>Loading meeting room...</p>
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
