
import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ChatBot from "@/pages/ChatBot";

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-[#F97316] to-[#D946EF] p-0 hover:scale-105 transition-transform"
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-[600px] max-w-[400px] p-0">
          <ChatBot />
        </DialogContent>
      </Dialog>
    </>
  );
};
