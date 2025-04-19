
import React from "react";
import { useSpeech } from "react-text-to-speech";
import { Button } from "./button";
import { Play, Pause, Square } from "lucide-react";

interface TextToSpeechProps {
  text: string;
}

const TextToSpeech = ({ text }: TextToSpeechProps) => {
  const {
    speechStatus,
    start,
    pause,
    stop,
  } = useSpeech({ text });

  return (
    <div className="flex items-center gap-2">
      {speechStatus !== "started" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={start}
          className="h-8"
        >
          <Play className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={pause}
          className="h-8"
        >
          <Pause className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={stop}
        className="h-8"
      >
        <Square className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TextToSpeech;
