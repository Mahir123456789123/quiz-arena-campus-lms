
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const CoursesPreview = () => {
  const courses = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      description: "Learn the fundamentals of computer science, algorithms, and programming.",
      instructor: "Dr. Rahul Sharma",
      level: "Beginner",
      duration: "8 weeks",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      category: "Computer Science",
    },
    {
      id: 2,
      title: "Advanced Data Structures",
      description: "Master advanced data structures and algorithms for technical interviews.",
      instructor: "Prof. Anita Desai",
      level: "Advanced",
      duration: "10 weeks",
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      category: "Computer Science",
    },
    {
      id: 3,
      title: "Business Economics 101",
      description: "Understanding the fundamental economic principles in business contexts.",
      instructor: "Dr. Priya Patel",
      level: "Intermediate",
      duration: "6 weeks",
      image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1749&q=80",
      category: "Business",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
            <p className="text-muted-foreground text-lg">Start your learning journey with these popular courses</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/courses">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover-scale">
              <div className="h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-card">
                    {course.category}
                  </Badge>
                  <Badge className="bg-edu-primary/10 text-edu-primary border-edu-primary">
                    {course.level}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{course.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  Instructor: {course.instructor}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{course.description}</p>
                <div className="flex items-center mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    Duration: {course.duration}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/courses/${course.id}`}>Enroll Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesPreview;
