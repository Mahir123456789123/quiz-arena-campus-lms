
import { Chatbot } from "@/components/chat/Chatbot";
import { Card } from "@/components/ui/card";

const ChatbotPage = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="p-6">
        <Chatbot />
      </Card>
    </div>
  );
};

export default ChatbotPage;
