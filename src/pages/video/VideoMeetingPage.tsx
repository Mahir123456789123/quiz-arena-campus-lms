
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

        const response = await fetch('/api/get-zego-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId,
            userId: profile.id,
            userName: profile.full_name || 'Anonymous',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get token');
        }

        const { token } = await response.json();

        const zp = ZegoUIKitPrebuilt.create(token);
        
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
