
import React, { useEffect, useRef } from 'react';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';

interface VideoStreamProps {
  zego: ZegoExpressEngine;
  stream?: MediaStream;
  muted?: boolean;
  className?: string;
}

export const VideoStream = ({ zego, stream, muted = false, className = '' }: VideoStreamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      className={`w-full h-full object-cover ${className}`}
      autoPlay
      playsInline
      muted={muted}
    />
  );
};
