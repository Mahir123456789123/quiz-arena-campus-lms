import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, X, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence} from 'framer-motion';


// Define an array of Tailwind color classes to use for cards
const cardColors = [
  "border-yellow-500", // #eab308 (yellow-500)
  "border-blue-500",   // #3b82f6 (blue-500)
  "border-teal-500",   // #14b8a6 (teal-500)
  "border-green-500",  // #22c55e (green-500)
  "border-purple-500", // #a855f7 (purple-500)
  "border-rose-500",   // #f43f5e (rose-500)
  "border-orange-500", // #f97316 (orange-500)
  "border-indigo-500", // #6366f1 (indigo-500)
  "border-sky-500",    // #0ea5e9 (sky-500)
  "border-emerald-500" // #10b981 (emerald-500)
];

const cardImages = [
  "https://picsum.photos/id/1016/400/300",
  "https://plus.unsplash.com/premium_photo-1720287601920-ee8c503af775?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1738082956220-a1f20a8632ce?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1664302244254-0b614b519f19?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1661434779070-cf8fc0e253ab?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1633493702341-4d04841df53b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1719825523711-eda3221c111c?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];


const CourseBrowser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const queryClient = useQueryClient();
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Added missing handleCardClick function
  const handleCardClick = (courseId: string) => {
    setSelectedCardId(courseId === selectedCardId ? null : courseId);
  };

  // Fetch all available courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['available_courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user_enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Enroll in a course
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          student_id: user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_enrollments', user?.id] });
      toast.success('Successfully enrolled in the course!');
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate key')) {
        toast.error('You are already enrolled in this course');
      } else {
        toast.error('Failed to enroll in the course');
      }
    }
  });

  // Enroll with course code
  const enrollWithCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      // First find the course with this code
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('code', code)
        .single();
        
      if (courseError) throw new Error('Invalid course code');
      if (!courseData) throw new Error('Course not found');

      // Then enroll the student
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseData.id,
          student_id: user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_enrollments', user?.id] });
      toast.success('Successfully enrolled in the course!');
      setCourseCode('');
      setShowCodeInput(false);
    },
    onError: (error: any) => {
      if (error.message.includes('Invalid course code') || error.message.includes('Course not found')) {
        toast.error('Invalid course code');
      } else if (error.message.includes('duplicate key')) {
        toast.error('You are already enrolled in this course');
      } else {
        toast.error('Failed to enroll in the course');
      }
    }
  });

  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  const handleEnrollWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim()) return;
    
    enrollWithCodeMutation.mutate(courseCode.trim());
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some((enrollment: any) => enrollment.course_id === courseId);
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter((course: any) => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    course.instructor.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to determine card color based on course ID
  const getCardColorClass = (courseId: string): string => {
    // Use the first character of the ID to create a consistent color mapping
    const charCode = courseId.charCodeAt(0);
    const colorIndex = charCode % cardColors.length;
    return cardColors[colorIndex];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Browse Courses</h1>
            <p className="text-muted-foreground mt-2">
              Discover and enroll in available courses
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {showCodeInput ? (
              <form onSubmit={handleEnrollWithCode} className="flex gap-2">
                <Input
                  placeholder="Enter course code..."
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                />
                <Button type="submit" disabled={!courseCode.trim()}>Enroll</Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCodeInput(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button onClick={() => setShowCodeInput(true)}>Enroll with Code</Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-7 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded mt-2 w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded mt-2 w-5/6"></div>
                  <div className="h-4 bg-muted rounded mt-2 w-4/6"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-medium">No courses found</h2>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or check back later for new courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.25, 
                    delay: index * 0.03,
                    ease: "easeOut" 
                  }}
                  layout
                  onClick={() => handleCardClick(course.id)}
                  className="relative cursor-pointer"
                >
                  <motion.div
                    layoutId={`card-container-${course.id}`}
                    className="rounded-2xl overflow-hidden"
                    animate={{
                      scale: selectedCardId === course.id ? 1.03 : 1,
                      zIndex: selectedCardId === course.id ? 10 : 1,
                      y: selectedCardId === course.id ? -8 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 1
                    }}
                    whileHover={{ 
                      scale: selectedCardId === course.id ? 1.03 : 1.02,
                      y: selectedCardId === course.id ? -8 : -4,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`flex flex-col h-full ${cardColors[index % cardColors.length]} ${
                        selectedCardId === course.id 
                          ? 'shadow-xl ring-2 ring-primary/50' 
                          : 'shadow hover:shadow-lg'
                      } transition-all duration-300`}
                    >
                      <motion.img 
                        layoutId={`card-image-${course.id}`}
                        src={cardImages[index % cardImages.length]}
                        alt="Course Image"
                        className="w-full h-48 object-cover"
                      />
                      <CardHeader>
                        <motion.div layoutId={`card-title-${course.id}`}>
                          <CardTitle>{course.title}</CardTitle>
                        </motion.div>
                        <motion.div layoutId={`card-instructor-${course.id}`}>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            {course.instructor.avatar_url ? (
                              <img 
                                src={course.instructor.avatar_url} 
                                alt={course.instructor.full_name}
                                className="h-5 w-5 rounded-full"
                              />
                            ) : (
                              <UserCircle className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span>Instructor: {course.instructor.full_name}</span>
                          </CardDescription>
                        </motion.div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <motion.div layoutId={`card-description-${course.id}`}>
                          {course.description ? (
                            <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No description provided</p>
                          )}
                        </motion.div>
                      </CardContent>
                      <CardFooter>
                        <motion.div 
                          layoutId={`card-button-${course.id}`}
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isEnrolled(course.id) ? (
                            <Button 
                              className="w-full" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/courses/${course.id}`);
                              }}
                            >
                              View Course
                            </Button>
                          ) : (
                            <Button 
                              className="w-full" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnroll(course.id);
                              }}
                            >
                              Enroll Now
                            </Button>
                          )}
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                  
                  {selectedCardId === course.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/20 z-0"
                      onClick={() => setSelectedCardId(null)}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CourseBrowser;
