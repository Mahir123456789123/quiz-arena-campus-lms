
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Trophy, Users } from "lucide-react";

interface QuizCardProps {
  title: string;
  description: string;
  participants: number;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  onJoin: () => void;
}

export const QuizCard = ({
  title,
  description,
  participants,
  difficulty,
  points,
  onJoin,
}: QuizCardProps) => {
  const difficultyColor = {
    Easy: "bg-green-500/10 text-green-500",
    Medium: "bg-yellow-500/10 text-yellow-500",
    Hard: "bg-red-500/10 text-red-500",
  }[difficulty];

  return (
    <Card className="quiz-card overflow-hidden hover:border-primary/50 transition-all duration-200">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={difficultyColor}>
            {difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">{participants}</span>
          </div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-semibold">{points} points</span>
          </div>
          <Button onClick={onJoin} className="gap-2">
            <Brain className="h-4 w-4" />
            Join Battle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
