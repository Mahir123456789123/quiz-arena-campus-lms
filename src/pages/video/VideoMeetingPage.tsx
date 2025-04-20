
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VideoMeetingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInstructor = useIsInstructor();
  const [isCopied, setIsCopied] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
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

  // This function handles safely clearing the container
  const clearZegoContainer = () => {
    if (zegoContainerRef.current) {
      // Using a safer approach to clear the container
      while (zegoContainerRef.current.firstChild) {
        zegoContainerRef.current.removeChild(zegoContainerRef.current.firstChild);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    
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
        
        // Safely clear container
        clearZegoContainer();

        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-zego-token', {
          body: {
            roomId,
            userId: user.id,
            userName: profile.full_name || 'Anonymous'
          },
        });

        // Handle potential errors from token generation
        if (tokenError || !tokenData?.token) {
          console.error('Token generation error:', tokenError || 'No token returned');
          const errorMessage = tokenError?.message || 'Failed to get a valid token';
          throw new Error(errorMessage);
        }

        console.log('Token generated successfully');
        
        // Create a new Zego instance
        const zp = ZegoUIKitPrebuilt.create(tokenData.token);
        
        // Store the instance for cleanup
        if (isMounted) {
          zegoInstanceRef.current = zp;
        }
        
        // Join the room with required parameters
        await zp.joinRoom({
          container: zegoContainerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          showTurnOffRemoteCameraButton: true,
          showTurnOffRemoteMicrophoneButton: true,
          showRemoveUserButton: isInstructor,
          onLeaveRoom: () => {
            if (isMounted) {
              cleanupZegoInstance();
              navigate(-1);
            }
          },
        });
        
        console.log('Successfully joined the meeting room');
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Zego initialization error:', error);
        if (isMounted) {
          setError(error.message || 'Failed to join meeting');
          setIsLoading(false);
          setShowErrorDialog(true);
          toast.error(error.message || 'Failed to join meeting');
        }
      }
    };

    // Give DOM time to render before initializing Zego
    const timer = setTimeout(() => {
      initializeZegoCloud();
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      cleanupZegoInstance();
    };
  }, [roomId, profile, navigate, isInstructor, user]);

  if (!roomId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto py-6">
          <Card className="p-4">
            <div className="text-center p-6">
              <h2 className="text-2xl font-bold text-destructive">Error: No Room ID Provided</h2>
              <p className="mt-2">A meeting room ID is required to join a meeting.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
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
                <span>Loading meeting room...</span>
              </div>
            )}
            {error && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
                <p className="text-destructive text-center mb-2">Error: {error}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  This could be due to incorrect credentials or a connection issue.
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}
            <div id="zego-container" ref={zegoContainerRef} className="w-full h-full"></div>
          </div>
        </Card>
      </main>
      <Footer />
      
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent description="There was a problem joining the meeting">
          <DialogHeader>
            <DialogTitle>Meeting Connection Error</DialogTitle>
            <DialogDescription>
              {error || "There was a problem connecting to the meeting room."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button 
              onClick={() => {
                setShowErrorDialog(false);
                window.location.reload();
              }}
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoMeetingPage;
