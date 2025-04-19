import React, { useState } from "react";
import { BookOpen, FileText, LucideIcon, Trophy, Users } from "lucide-react";
import { FocusCards } from "@/components/ui/focus-cards";

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Feature = ({ icon: Icon, title, description }: FeatureProps) => {
  return (
    <div className="edu-card p-6 flex flex-col items-start rounded-lg shadow-lg hover:shadow-xl transition-all bg-white">
      <div className="p-3 rounded-full bg-edu-muted text-edu-primary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  
  const features = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      description: "Sequential courses with multimedia content, prerequisites, and progress tracking.",
      src: "https://images.unsplash.com/photo-1581726707445-75cbe4efc586?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: Trophy,
      title: "Competitive Quizzes",
      description: "Real-time multiplayer quiz battles with instant feedback and leaderboards.",
      src: "https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: FileText,
      title: "Content Hub",
      description: "Centralized, searchable repository of all course materials and community uploads.",
      src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Tailored dashboards and features for students, instructors, and administrators.",
      src: "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
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

        {/* Custom focus cards with titles below */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
          {features.map((feature, index) => (
            <div key={feature.title} className="flex flex-col">
              {/* Focus Card */}
              <div
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                className={`rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-52 transition-all duration-300 ease-out ${
                  hovered !== null && hovered !== index ? "blur-sm scale-[0.98]" : ""
                }`}
              >
                <img
                  src={feature.src}
                  alt={feature.title}
                  className="object-cover absolute inset-0"
                />
                <div
                  className={`absolute inset-0 bg-black/50 flex items-end py-4 px-3 transition-opacity duration-300 ${
                    hovered === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="text-sm font-medium text-white">
                    {feature.description}
                  </div>
                </div>
              </div>
              
              {/* Title below card - always visible */}
              <div className="mt-3 text-center">
                <h3 className="text-lg font-bold">{feature.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;