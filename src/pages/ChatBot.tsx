
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Boxes } from "@/components/ui/background-boxes";
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

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !user) return;
    
    // Add user message to chat
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
      // Call Supabase Edge Function for chatbot response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
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
      
      // Add bot response to chat and save to Supabase
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      
      // Save messages to Supabase
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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex flex-col">
      <div className="absolute inset-0 w-full h-full z-10">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/10 z-20" />
        <Boxes />
      </div>
      
      <div className="container mx-auto flex flex-col h-screen p-4 relative z-30">
        <div className="flex-1 overflow-y-auto mb-4 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 p-4">
          <div className="space-y-4">
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
                      ? "bg-edu-primary text-white"
                      : "bg-white/10 text-white"
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
        </div>

        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 backdrop-blur-sm bg-white/5 border border-white/10 p-2 rounded-lg"
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-transparent border-white/10 text-white focus-visible:ring-edu-primary"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading}
            className="bg-edu-primary hover:bg-edu-primary/80"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
