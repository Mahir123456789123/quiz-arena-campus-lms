import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Trophy, Users, Clock, Sparkles, BookOpen } from "lucide-react";

interface QuizCardProps {
  title: string;
  description: string;
  participants: number;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  onJoin: () => void;
  disabled?: boolean;
}

export const QuizCard = ({
  title,
  description,
  participants,
  difficulty,
  points,
  onJoin,
  disabled = false,
}: QuizCardProps) => {
  const difficultyStyles = {
    Easy: {
      bg: "bg-emerald-400",
      text: "text-emerald-50",
      border: "border-emerald-500",
      icon: <Sparkles className="h-4 w-4 text-emerald-100" />,
      badge: "bg-emerald-600 text-emerald-50"
    },
    Medium: {
      bg: "bg-purple-500",
      text: "text-purple-50",
      border: "border-purple-600",
      icon: <Clock className="h-4 w-4 text-purple-100" />,
      badge: "bg-purple-600 text-purple-50"
    },
    Hard: {
      bg: "bg-rose-500",
      text: "text-rose-50",
      border: "border-rose-500",
      icon: <Brain className="h-4 w-4 text-rose-100" />,
      badge: "bg-rose-500 text-rose-50"
    }
  }[difficulty];

  return (
    <div className={`rounded-lg border ${difficultyStyles.bg} ${difficultyStyles.border} ${difficultyStyles.text} overflow-hidden transition-all duration-200 hover:shadow-md`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={`font-medium text-xs px-2.5 py-0.5 rounded-md ${difficultyStyles.badge}`}>
            <div className="flex items-center gap-1.5">
              {difficultyStyles.icon}
              {difficulty}
            </div>
          </Badge>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/10">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{participants}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title}
        </h3>
        
        <p className="text-sm opacity-90 mb-6 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Trophy className="h-4 w-4 text-amber-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs opacity-80">Reward</span>
              <span className="font-bold text-amber-200">{points} pts</span>
            </div>
          </div>
          
          <Button
            onClick={onJoin}
            size="sm"
            className={`rounded-full gap-2 ${difficulty === 'Easy' ? 'bg-emerald-500 hover:bg-emerald-300' : difficulty === 'Medium' ? 'bg-purple-400 hover:bg-purple-300' : 'bg-rose-400 hover:bg-rose-300'}`}
            disabled={disabled}
          >
            <Brain className="h-4 w-4" />
            <span>Join Battle</span>
          </Button>
        </div>
      </div>
    </div>
  );
};