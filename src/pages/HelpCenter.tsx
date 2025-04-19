
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I get started?",
      answer: "Click on the Get Started button and create your account to begin your learning journey."
    },
    {
      question: "What courses are available?",
      answer: "We offer a wide range of courses across different subjects including Computer Science, Business, Engineering, and more."
    },
    {
      question: "How do quiz battles work?",
      answer: "Quiz battles are real-time competitive quizzes where you can challenge other students and test your knowledge."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Help Center</h1>
        
        <div className="grid gap-6 mb-12">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
