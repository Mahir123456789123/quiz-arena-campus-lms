
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen px-4 md:px-6">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#F97316] via-[#D946EF] to-[#8B5CF6]">
        <div className="absolute inset-0 w-full h-full bg-black/20" />
      </div>
      
      <div className="container mx-auto relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-screen">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Learn, Compete, <span className="text-white/90">Excel</span>
            </h1>
            <p className="text-xl text-white/80">
              The all-in-one learning platform for your campus that makes education engaging,
              structured, and competitive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button 
                size="lg" 
                className="bg-white text-[#F97316] hover:bg-white/90"
                asChild
              >
                <Link to="/login">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to="/courses">Explore Courses</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <BookOpen className="text-white h-6 w-6" />
                <p className="font-medium text-white">Structured Learning</p>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <Trophy className="text-white h-6 w-6" />
                <p className="font-medium text-white">Quiz Battles</p>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <Users className="text-white h-6 w-6" />
                <p className="font-medium text-white">Community Hub</p>
              </div>
            </div>
          </div>
          
          <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
              alt="Students learning" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <div className="bg-white/90 rounded-lg p-4 shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 bg-[#F97316] rounded-full"></div>
                  <p className="text-sm font-medium text-[#F97316]">Live Quiz Battle</p>
                </div>
                <h3 className="font-bold">Data Structures Challenge</h3>
                <p className="text-sm text-gray-600 mt-1">42 participants • Starting in 10 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
