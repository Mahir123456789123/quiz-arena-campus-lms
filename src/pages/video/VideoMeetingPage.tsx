import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Share2, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createZegoClient, destroyZegoClient } from "@/lib/zegoClient";
import { VideoStream } from "@/components/video/VideoStream";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

const VideoMeetingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zego, setZego] = useState<ZegoExpressEngine | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const streamIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeZego = async () => {
      try {
        if (!roomId || !profile || !user) {
          throw new Error("Missing required information");
        }

        // Get token from Supabase edge function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke("get-zego-token", {
          body: {
            roomId,
            userId: user.id,
            userName: profile.full_name || "Anonymous"
          }
        });

        if (tokenError || !tokenData?.token) {
          throw new Error(tokenError?.message || "Failed to get token");
        }

        // Create Zego client
        const zegoInstance = await createZegoClient(tokenData.token);
        if (!mounted) return;
        setZego(zegoInstance);

        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        setLocalStream(stream);

        // Login to room
        await zegoInstance.loginRoom(
          roomId,
          tokenData.token,
          { userID: user.id, userName: profile.full_name || "Anonymous" },
          { userUpdate: true }
        );

        // Start publishing stream
        const streamID = `${user.id}-stream`;
        streamIdRef.current = streamID;
        await zegoInstance.startPublishingStream(streamID, stream);

        // Handle remote streams
        zegoInstance.on("roomStreamUpdate", async (roomID: string, updateType: "ADD" | "DELETE", streamList: any[]) => {
          if (updateType === "ADD") {
            const newStreams: Record<string, MediaStream> = {};
            for (const streamInfo of streamList) {
              try {
                const remoteStream = await zegoInstance.startPlayingStream(streamInfo.streamID);
                newStreams[streamInfo.streamID] = remoteStream;
              } catch (error) {
                console.error("Error playing remote stream:", error);
              }
            }
            setRemoteStreams(prev => ({ ...prev, ...newStreams }));
          } else if (updateType === "DELETE") {
            setRemoteStreams(prev => {
              const updated = { ...prev };
              streamList.forEach(stream => {
                delete updated[stream.streamID];
              });
              return updated;
            });
          }
        });

        setIsLoading(false);
      } catch (error: any) {
        console.error("Failed to initialize meeting:", error);
        if (mounted) {
          setError(error.message);
          setIsLoading(false);
          toast.error(error.message);
        }
      }
    };

    initializeZego();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (streamIdRef.current && zego) {
        zego.stopPublishingStream(streamIdRef.current);
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
              <h2 className="text-2xl font-bold text-destructive">
                Error: No Room ID Provided
              </h2>
              <p className="mt-2">
                A meeting room ID is required to join a meeting.
              </p>
              <Button className="mt-4" onClick={() => navigate(-1)}>
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
            <h2 className="text-2xl font-bold">Video Meeting</h2>
            <p className="text-muted-foreground">Room ID: {roomId}</p>
          </div>

          <div className="w-full aspect-video bg-muted relative rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Joining meeting...</span>
              </div>
            )}

            {error && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
                <p className="text-destructive">Error: {error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}

            {!isLoading && !error && (
              <div className="grid gap-4 p-4 h-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {localStream && zego && (
                  <div className="relative">
                    <VideoStream
                      zego={zego}
                      stream={localStream}
                      muted={true}
                      className="rounded-lg"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      <Button variant="secondary" size="icon" onClick={toggleMute}>
                        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button variant="secondary" size="icon" onClick={toggleVideo}>
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
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default VideoMeetingPage;
