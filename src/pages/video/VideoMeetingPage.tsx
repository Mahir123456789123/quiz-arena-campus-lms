
import React from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const VideoMeetingPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { profile } = useAuth();

  const myMeeting = async (element: HTMLDivElement) => {
    const appID = 123456789; // This will be replaced by the edge function
    const serverSecret = "dummy-secret"; // This will be replaced by the edge function
    
    const kitToken = await ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId!,
      Date.now().toString(),
      profile?.full_name || 'Anonymous'
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      showTurnOffRemoteCameraButton: true,
      showTurnOffRemoteMicrophoneButton: true,
      showLeaveButton: true,
    });
  };

  if (!roomId) {
    return <div>Error: No room ID provided</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6">
        <Card className="p-4">
          <div ref={myMeeting} className="w-full aspect-video" />
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default VideoMeetingPage;
