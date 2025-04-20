
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useIsInstructor } from '@/hooks/useIsInstructor';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Share2, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createZegoClient, destroyZegoClient } from '@/lib/zegoClient';
import { VideoStream } from '@/components/video/VideoStream';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';

// Define the correct type for the stream update event
interface ZegoStreamUpdateEvent {
  updateType: 'ADD' | 'DELETE';
  streamList: Array<{
    streamID: string;
    user: {
      userID: string;
    };
  }>;
}

const VideoMeetingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInstructor = useIsInstructor();
  const [isCopied, setIsCopied] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [zego, setZego] = useState<ZegoExpressEngine | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const copyMeetingLink = () => {
    if (!roomId) return;
    
    const url = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Meeting link copied to clipboard');
    
    setTimeout(() => setIsCopied(false), 3000);
  };

  useEffect(() => {
    let mounted = true;

    const initializeZego = async () => {
      try {
        if (!roomId || !profile || !user) {
          throw new Error('Missing required information');
        }

        console.log('Initializing meeting room:', roomId);

        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-zego-token', {
          body: {
            roomId,
            userId: user.id,
            userName: profile.full_name || 'Anonymous'
          },
        });

        if (tokenError || !tokenData?.token) {
          console.error('Token generation error:', tokenError || 'No token returned');
          throw new Error(tokenError?.message || 'Failed to get a valid token');
        }

        console.log('Token generated successfully');

        const zegoInstance = await createZegoClient(tokenData.token);
        if (mounted) {
          setZego(zegoInstance);
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });

        if (mounted) {
          setLocalStream(stream);
        }

        await zegoInstance.loginRoom(
          roomId,
          tokenData.token,
          { userID: user.id, userName: profile.full_name || 'Anonymous' },
          { userUpdate: true }
        );

        await zegoInstance.startPublishingStream(`${user.id}-${Date.now()}`, stream);

        // Use the properly typed event handler with correct parameter types
        zegoInstance.on('roomStreamUpdate', async (roomID: string, updateInfo: ZegoStreamUpdateEvent) => {
          if (updateInfo.updateType === 'ADD') {
            for (const stream of updateInfo.streamList) {
              const remoteStream = await zegoInstance.startPlayingStream(stream.streamID);
              if (mounted) {
                setRemoteStreams(prev => ({
                  ...prev,
                  [stream.streamID]: remoteStream
                }));
              }
            }
          } else if (updateInfo.updateType === 'DELETE') {
            for (const stream of updateInfo.streamList) {
              if (mounted) {
                setRemoteStreams(prev => {
                  const newStreams = { ...prev };
                  delete newStreams[stream.streamID];
                  return newStreams;
                });
              }
            }
          }
        });

        console.log('Successfully joined the meeting room');
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Zego initialization error:', error);
        if (mounted) {
          setError(error.message || 'Failed to join meeting');
          setIsLoading(false);
          setShowErrorDialog(true);
          toast.error(error.message || 'Failed to join meeting');
        }
      }
    };

    initializeZego();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      destroyZegoClient();
    };
  }, [roomId, profile, user]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

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

          <div className="w-full aspect-video bg-muted relative rounded-lg overflow-hidden">
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

            {!isLoading && !error && (
              <div className="relative w-full h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
                  {localStream && zego && (
                    <div className="relative">
                      <VideoStream
                        zego={zego}
                        stream={localStream}
                        muted={true}
                        className="rounded-lg"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={toggleMute}
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={toggleVideo}
                        >
                          {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {Object.entries(remoteStreams).map(([streamId, stream]) => (
                    <div key={streamId} className="relative">
                      {zego && (
                        <VideoStream
                          zego={zego}
                          stream={stream}
                          className="rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>
      <Footer />
      
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
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
