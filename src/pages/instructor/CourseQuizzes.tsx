import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import InstructorQuizCreator from '@/components/quiz/InstructorQuizCreator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, Users } from 'lucide-react';
import type { Quiz } from '@/types/quiz';

const CourseQuizzes = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
    fetchActiveRooms();

    // Set up a realtime subscription for quizzes
    const quizzesChannel = supabase
      .channel('quizzes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'quizzes', filter: `created_by=eq.${user?.id}` }, 
        () => {
          fetchQuizzes();
        }
      )
      .subscribe();

    // Set up a realtime subscription for active rooms
    const roomsChannel = supabase
      .channel('instructor_rooms_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'quiz_rooms', filter: `host_id=eq.${user?.id}` }, 
        () => {
          fetchActiveRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quizzesChannel);
      supabase.removeChannel(roomsChannel);
    };
  }, [user?.id]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      // Fetch all quizzes created by this instructor
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typeSafeQuizzes = data.map(quiz => ({
        ...quiz,
        difficulty: quiz.difficulty as Quiz['difficulty']
      }));
      
      setQuizzes(typeSafeQuizzes);
    } catch (error: any) {
      toast.error('Failed to load quizzes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_rooms')
        .select(`
          *,
          quiz:quizzes(id, title),
          participants:quiz_participants(*)
        `)
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setActiveRooms(data);
    } catch (error: any) {
      console.error('Failed to load active rooms', error);
    }
  };

  const startQuizRoom = async (quizId: string) => {
    try {
      // Generate a random 3-digit room code
      const roomCode = Math.floor(100 + Math.random() * 900).toString();

      // Create a quiz room
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .insert({
          quiz_id: quizId,
          room_code: roomCode,
          host_id: user?.id,
          status: 'waiting',
          max_players: 50
        })
        .select()
        .single();

      if (roomError) throw roomError;

      toast.success(`Quiz room created! Room code: ${roomCode}`);
      navigate(`/quiz-battle/${room.id}`);
    } catch (error: any) {
      toast.error('Failed to create quiz room');
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Course Quizzes</h1>
          
          <Tabs defaultValue="create">
            <TabsList className="mb-4">
              <TabsTrigger value="create">Create Quiz</TabsTrigger>
              <TabsTrigger value="manage">Manage Quizzes</TabsTrigger>
              <TabsTrigger value="rooms">Active Rooms</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              {courseId ? (
                <InstructorQuizCreator key={courseId} />
              ) : (
                <div className="p-6 text-center border rounded-lg">
                  <p className="text-lg mb-4">Select a course to create quizzes for</p>
                  <Button onClick={() => navigate('/instructor')}>
                    Go to Courses
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="manage">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  <p>Loading quizzes...</p>
                ) : quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <Card key={quiz.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-primary" />
                          {quiz.title}
                        </CardTitle>
                        <CardDescription>
                          {quiz.question_count} questions · {quiz.difficulty}
                          {quiz.is_published ? (
                            <span className="ml-2 text-green-500">• Published</span>
                          ) : (
                            <span className="ml-2 text-amber-500">• Draft</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                          {quiz.description || "No description provided"}
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => startQuizRoom(quiz.id)}
                            disabled={!quiz.is_published || quiz.question_count === 0}
                            className="w-full"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Start Quiz Room
                          </Button>
                          {(!quiz.is_published || quiz.question_count === 0) && (
                            <p className="text-xs text-muted-foreground text-center">
                              Quiz must be published and have questions to start a room
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center p-8 border rounded-lg">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">You haven't created any quizzes yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">Use the "Create Quiz" tab to get started.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="rooms">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeRooms.length > 0 ? (
                  activeRooms.map(room => (
                    <Card key={room.id}>
                      <CardHeader>
                        <CardTitle>Room {room.room_code}</CardTitle>
                        <CardDescription>
                          Quiz: {room.quiz?.title || 'Unknown'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-sm">
                            Status: <span className={room.status === 'waiting' ? 'text-amber-500' : 'text-green-500'}>
                              {room.status === 'waiting' ? 'Waiting for players' : 'Active'}
                            </span>
                          </p>
                          <p className="text-sm">
                            Participants: {room.participants ? room.participants.length : 0}
                          </p>
                          <p className="text-sm">
                            Created: {new Date(room.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          onClick={() => navigate(`/quiz-battle/${room.id}`)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Room
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center p-8 border rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active quiz rooms found.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create a room from the "Manage Quizzes" tab.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseQuizzes;
