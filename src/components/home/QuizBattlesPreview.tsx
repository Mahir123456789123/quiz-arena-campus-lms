
import { ArrowRight, Clock, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const QuizBattlesPreview = () => {
  const upcomingQuizzes = [
    {
      id: 1,
      title: "Data Structures Challenge",
      description: "Test your knowledge of arrays, linked lists, trees, and advanced algorithms.",
      participants: 42,
      startTime: "Today, 7:00 PM",
      category: "Computer Science",
      difficulty: "Advanced",
      isLive: true,
    },
    {
      id: 2,
      title: "Marketing Concepts Quiz",
      description: "Competitive quiz on marketing principles, strategies, and case studies.",
      participants: 24,
      startTime: "Tomorrow, 3:00 PM",
      category: "Business",
      difficulty: "Intermediate",
      isLive: false,
    },
    {
      id: 3,
      title: "Physics Fundamentals",
      description: "Test your knowledge of mechanics, thermodynamics, and electromagnetism.",
      participants: 36,
      startTime: "Today, 9:00 PM",
      category: "Physics",
      difficulty: "Beginner",
      isLive: false,
    },
  ];

  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-br from-edu-secondary/5 to-edu-primary/5">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Quiz Battles</h2>
            <p className="text-muted-foreground text-lg">Compete with peers in real-time quiz matches</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/quizzes">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {upcomingQuizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="bg-card">
                    {quiz.category}
                  </Badge>
                  {quiz.isLive ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500 flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse-light"></div>
                      Live Now
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Upcoming</Badge>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                <p className="text-muted-foreground mb-4">{quiz.description}</p>
                
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-edu-secondary" />
                    <span>{quiz.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-edu-secondary" />
                    <span>{quiz.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-edu-secondary" />
                    <span>{quiz.difficulty} difficulty</span>
                  </div>
                </div>
                
                <Button asChild className="w-full">
                  <Link to={`/quizzes/${quiz.id}`}>
                    {quiz.isLive ? "Join Now" : "Set Reminder"}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuizBattlesPreview;
