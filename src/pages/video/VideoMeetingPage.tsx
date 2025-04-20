
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useIsInstructor } from '@/hooks/useIsInstructor';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoMeetingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInstructor = useIsInstructor();
  const [isCopied, setIsCopied] = useState(false);
  const zegoContainerRef = useRef<HTMLDivElement>(null);
  const zegoInstanceRef = useRef<any>(null);

  const copyMeetingLink = () => {
    if (!roomId) return;
    
    const url = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Meeting link copied to clipboard');
    
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Cleanup function to handle ZegoUIKit instance destruction
  const cleanupZegoInstance = () => {
    if (zegoInstanceRef.current) {
      try {
        console.log('Cleaning up Zego instance');
        zegoInstanceRef.current = null;
      } catch (err) {
        console.error('Error cleaning up Zego instance:', err);
      }
    }
  };

  useEffect(() => {
    const initializeZegoCloud = async () => {
      try {
        if (!roomId || !profile || !user) {
          throw new Error('Missing required information');
        }

        console.log('Initializing meeting room:', roomId);
        
        // Make sure we have the container element ready
        if (!zegoContainerRef.current) {
          throw new Error('Container element not found');
        }

        // Clean up any existing instance
        cleanupZegoInstance();
        
        // Clear container manually
        if (zegoContainerRef.current) {
          zegoContainerRef.current.innerHTML = '';
        }

        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-zego-token', {
          body: {
            roomId,
            userId: user.id,
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
        
        const zp = ZegoUIKitPrebuilt.create(tokenData.token);
        zegoInstanceRef.current = zp;
        
        await zp.joinRoom({
          container: zegoContainerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          showTurnOffRemoteCameraButton: true,
          showTurnOffRemoteMicrophoneButton: true,
          showRemoveUserButton: isInstructor,
          onLeaveRoom: () => {
            cleanupZegoInstance();
            navigate(-1);
          },
        });
        console.log('Successfully joined the meeting room');
        setIsLoading(false);
      } catch (error: any) {
        console.error('Zego initialization error:', error);
        setError(error.message || 'Failed to join meeting');
        setIsLoading(false);
        toast.error(error.message || 'Failed to join meeting');
      }
    };

    // Add a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeZegoCloud();
    }, 1000);

    return () => {
      clearTimeout(timer);
      cleanupZegoInstance();
    };
  }, [roomId, profile, navigate, isInstructor, user]);

  if (!roomId) {
    return <div>Error: No room ID provided</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6">
        <Card className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Video Meeting</h2>
              <p className="text-muted-foreground">Room ID: {roomId}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={copyMeetingLink}
            >
              <Share2 className="h-4 w-4" />
              {isCopied ? 'Copied!' : 'Share'}
            </Button>
          </div>
          <div className="w-full aspect-video bg-muted relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <p>Loading meeting room...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
                <p className="text-destructive text-center mb-2">Error: {error}</p>
                <p className="text-sm text-muted-foreground">
                  This could be due to incorrect credentials or a connection issue.
                </p>
              </div>
            )}
            <div id="zego-container" ref={zegoContainerRef} className="w-full h-full"></div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default VideoMeetingPage;
