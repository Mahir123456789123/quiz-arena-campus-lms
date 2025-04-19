
import { BookOpen, FileText, LucideIcon, Trophy, Users } from "lucide-react";

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Feature = ({ icon: Icon, title, description }: FeatureProps) => {
  return (
    <div className="edu-card p-6 flex flex-col items-start">
      <div className="p-3 rounded-full bg-edu-muted text-edu-primary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      description: "Sequential courses with multimedia content, prerequisites, and progress tracking.",
    },
    {
      icon: Trophy,
      title: "Competitive Quizzes",
      description: "Real-time multiplayer quiz battles with instant feedback and leaderboards.",
    },
    {
      icon: FileText,
      title: "Content Hub",
      description: "Centralized, searchable repository of all course materials and community uploads.",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Tailored dashboards and features for students, instructors, and administrators.",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Designed to enhance your campus learning experience with engaged, structured, and competitive education.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
