import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CountUp from 'react-countup';

const CTASection = () => {
  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-r from-edu-secondary to-edu-primary text-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <GraduationCap className="h-16 w-16 mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your learning experience?</h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of students at your campus who are already using PadhleBhai to enhance their academic journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
                <Link to="/courses">Explore Courses</Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-2">
                <CountUp end={200} duration={2} enableScrollSpy={true} scrollSpyOnce={true} />
                +
              </h3>
              <p className="opacity-90">Courses Available</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-2">
                <CountUp end={50000} duration={2} enableScrollSpy={true} scrollSpyOnce={true} />
                +
              </h3>
              <p className="opacity-90">Active Students</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-2">
                <CountUp end={1000} duration={2} enableScrollSpy={true} scrollSpyOnce={true} />
                +
              </h3>
              <p className="opacity-90">Quiz Battles</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-2">
                <CountUp end={95} duration={2} enableScrollSpy={true} scrollSpyOnce={true} />
                %
              </h3>
              <p className="opacity-90">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
