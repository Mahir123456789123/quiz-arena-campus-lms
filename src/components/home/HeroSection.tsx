import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SlideArrowButton from "@/components/ui/slide-arrow-button";
import { Boxes } from "@/components/ui/background-boxes";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";


const HeroSection = () => {
  return (
    <section id="hero" className="relative bg-gradient-to-b from-slate-950 to-slate-900 h-screen flex items-center overflow-hidden">
      {/* Boxes Background */}
      <Boxes className="opacity-500" />
      
      {/* Content container with pointer-events-none to allow clicks to reach the boxes */}
      <div className="container relative z-10 mx-auto px-4 text-center text-white pointer-events-none">
      <TypewriterEffect className="text-4xl md:text-6xl mb-8" cursorClassName="bg-blue-400"
        words={[
          { text: "Learn,", className: "text-white" },
          { text: "Compete,", className: "text-white" },
          { text: "Excel", className: "text-blue-400" },
        ]}
      />


        <p className="text-xl md:text-2xl font-medium text-blue-200 mb-12 max-w-3xl mx-auto">
          Making education engaging, structured, and competitive.
        </p>
        
        {/* Re-enable pointer events just for the button */}
        <div className="flex justify-center mb-20 pointer-events-auto">
          <Link to="/courses">
            <SlideArrowButton text="Ready to get Started?" primaryColor="#60a5fa" />
          </Link> 
        </div>

        
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all pointer-events-auto">
            <BookOpen className="text-blue-400 h-6 w-6" />
            <p className="font-medium">Structured Learning</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all pointer-events-auto">
            <Trophy className="text-blue-400 h-6 w-6" />
            <p className="font-medium">Quiz Battles</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all pointer-events-auto">
            <Users className="text-blue-400 h-6 w-6" />
            <p className="font-medium">Community Hub</p>
          </div>
        </div> */}
      </div>
      
      {/* Top courses heading - re-enable pointer events */}
      {/* <div className="absolute bottom-8 left-0 right-0 px-4 pointer-events-none">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">TOP COURSES</h2>
          <div className="flex gap-2 pointer-events-auto">
            <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Button>
            <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div> */}
    </section>
  );
};

export default HeroSection;