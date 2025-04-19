
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Chatbot = () => {
  const [studentId, setStudentId] = useState("");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<Array<{ sender: string; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!studentId || !input) return;

    const userMessage = { sender: "You", text: input };
    setChat((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Step 1: Fetch student progress & deadlines
      const fetchRes = await axios.post("http://127.0.0.1:5000/fetch", {
        student_id: studentId,
      });

      const { progress, deadlines } = fetchRes.data;

      // Step 2: Send full data to chatbot
      const chatRes = await axios.post("http://127.0.0.1:5000/chat_with_data", {
        student_id: studentId,
        message: input,
        progress,
        deadlines,
      });

      const botMessage = { sender: "Bot", text: chatRes.data.response };
      setChat((prev) => [...prev, botMessage]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "Bot", text: "⚠️ Error communicating with server" },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && input) {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">🎓 Academic Chatbot</h2>
        <Input
          placeholder="Enter your student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <ScrollArea className="h-[400px] border rounded-md p-4">
        <div className="flex flex-col gap-2">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.sender === "You"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              } max-w-[80%]`}
            >
              <p className="text-sm font-semibold mb-1">{msg.sender}</p>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask something..."
          disabled={!studentId}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading || !input}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </div>
  );
};
