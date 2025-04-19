
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

async function fetchFeaturedCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      profiles:instructor_id (
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) throw error;
  return data;
}

const CoursesPreview = () => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: fetchFeaturedCourses
  });

  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background via-background to-muted/50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Featured Courses
            </h2>
            <p className="text-muted-foreground text-lg">
              Start your learning journey with these popular courses
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link to="/courses" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Show loading skeleton cards
            [...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-6 w-3/4 bg-muted rounded mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : courses.length > 0 ? (
            courses.map((course: any) => (
              <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-background border-none">
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={course.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=60"}
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary">
                      {course.code}
                    </Badge>
                    <Badge variant="secondary">
                      New
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    By {course.profiles?.full_name || 'Unknown Instructor'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">{course.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/courses/${course.id}`}>View Course</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No courses available yet.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link to="/courses" className="gap-2">
              View All Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesPreview;
