
"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card as CustomCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CoursesPreview = () => {
  const courses = [
    {
      id: 1,
      title: "Graph Theory",
      description: "Advanced study of graph theory, algorithms and applications.",
      instructor: "Prof. Vikram Sharma",
      level: "Beginner",
      duration: "8 weeks",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      category: "Computer Science",
    },
    {
      id: 2,
      title: "Advanced Data Structures",
      description: "Master advanced data structures and algorithms for technical interviews.",
      instructor: "Prof. Anita Desai",
      level: "Advanced",
      duration: "10 weeks",
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      category: "Computer Science",
    },
    {
      id: 3,
      title: "Material Science",
      description: "Study of properties and applications of engineering materials.",
      instructor: "Prof. Vikram Sharma",
      level: "Intermediate",
      duration: "6 weeks",
      image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1749&q=80",
      category: "Computer Science",
    },
    {
      id: 4,
      title: "Engineering Graphics",
      description: "Visual communication through technical drawing and computer-aided design.",
      instructor: "Prof. Arjun Kumar",
      level: "Intermediate",
      duration: "6 weeks",
      image: "https://plus.unsplash.com/premium_photo-1661771673036-5b13be70d6e7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Computer Science",
    },
  ];

  const carouselItems = courses.map((course, index) => ({
    category: course.category,
    title: (
      <div className="flex flex-col gap-1">
        <span className="text-xl font-semibold">{course.title}</span>
        <span className="text-sm text-white">{course.instructor}</span>
        <span className="text-sm text-white">{course.duration} • {course.level}</span>
      </div>
    ),
    src: course.image,
    content: (
      <CustomCard className="bg-[#F5F5F7] dark:bg-neutral-800 p-6 md:p-6 rounded-2xl h-[350px] flex flex-col justify-between">
        <CardHeader className="mb-4">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="bg-card">{course.category}</Badge>
            <Badge className="bg-edu-primary/10 text-edu-primary border-edu-primary">{course.level}</Badge>
          </div>
          <CardTitle className="mt-2 text-xl font-semibold">{course.title}</CardTitle>
          <CardDescription className="text-base text-primary-700 dark:text-primary-300">Instructor: {course.instructor}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto">
            {course.description}
          </p>
          <p className="mt-4 text-base text-primary-700 dark:text-primary-300">Duration: {course.duration}</p>
        </CardContent>
        <CardFooter className="mt-6">
          <Button asChild className="w-full">
            <Link to={`/courses/${course.id}`}>Enroll Now</Link>
          </Button>
        </CardFooter>
      </CustomCard>
    ),
  }));

  return (
    <section className="w-full h-full py-20 px-4 md:px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h2 className="text-3xl font-bold mb-1">Featured Courses</h2>
            <p className="text-muted-foreground text-lg">Start your learning journey with these popular courses</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/courses">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Carousel items={carouselItems.map((course, idx) => (
          <Card key={course.src} card={course} index={idx} />
        ))} />
      </div>
    </section>
  );
};

export default CoursesPreview;
