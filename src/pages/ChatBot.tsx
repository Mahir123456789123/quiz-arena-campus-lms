import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your learning assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !user?.id) return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.session?.access_token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          student_id: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const data = await response.json();
      
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      
      await supabase.from('chat_messages').insert([
        { 
          user_id: user.id, 
          message: newUserMessage.text, 
          is_bot: false,
          conversation_id: newUserMessage.id 
        },
        { 
          user_id: user.id, 
          message: newBotMessage.text, 
          is_bot: true,
          conversation_id: newUserMessage.id 
        }
      ]);

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the chatbot. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#F97316]/5 via-[#D946EF]/5 to-[#8B5CF6]/5">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">AI Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                message.isUser
                  ? "bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white"
                  : "bg-white/10 text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t bg-background/50 backdrop-blur-sm"
      >
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-transparent border-white/20"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading}
            className="bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white hover:opacity-90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;
