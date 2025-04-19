
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chatbot } from "./Chatbot";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bot className="h-6 w-6" />
      </Button>

      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-[400px] h-[600px] shadow-xl">
          <Chatbot />
        </Card>
      )}
    </div>
  );
};
