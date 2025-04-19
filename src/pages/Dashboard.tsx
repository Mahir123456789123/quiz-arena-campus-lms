
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, BookOpen, Calendar, ChevronRight, Clock, Trophy, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Dashboard = () => {
  // Mock data
  const enrolledCourses = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      progress: 65,
      nextLesson: "Data Structures Basics",
      nextLessonTime: "Today, 3:00 PM",
    },
    {
      id: 2,
      title: "Advanced Data Structures",
      progress: 30,
      nextLesson: "Graphs and Algorithms",
      nextLessonTime: "Tomorrow, 10:00 AM",
    },
  ];

  const upcomingQuizzes = [
    {
      id: 1,
      title: "Data Structures Challenge",
      time: "Today, 7:00 PM",
      participants: 42,
      isLive: true,
    },
    {
      id: 2,
      title: "Marketing Concepts Quiz",
      time: "Tomorrow, 3:00 PM",
      participants: 24,
      isLive: false,
    },
  ];

  const recentActivity = [
    {
      type: "completed_lesson",
      title: "Introduction to Algorithms",
      course: "Introduction to Computer Science",
      time: "2 hours ago",
    },
    {
      type: "quiz_result",
      title: "Basic Programming Quiz",
      score: "85%",
      time: "Yesterday",
    },
    {
      type: "new_material",
      title: "Graph Theory Slides",
      course: "Advanced Data Structures",
      time: "Yesterday",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 px-4 md:px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Hello, Student</h1>
              <p className="text-muted-foreground">Welcome back to your learning dashboard</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Your Progress</CardTitle>
                <CardDescription>Overall learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="10"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                      ></circle>
                      <circle
                        className="text-edu-primary stroke-current"
                        strokeWidth="10"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset="88"
                        transform="rotate(-90 50 50)"
                      ></circle>
                    </svg>
                    <div className="absolute">
                      <div className="text-3xl font-bold">65%</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Courses</span>
                    <span className="font-bold">4/6</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Quizzes</span>
                    <span className="font-bold">12/20</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Upcoming Quizzes</CardTitle>
                <CardDescription>Your scheduled quiz battles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingQuizzes.map((quiz) => (
                  <Link to={`/quizzes/${quiz.id}`} key={quiz.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{quiz.title}</span>
                          {quiz.isLive && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500 flex items-center gap-1">
                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse-light"></div>
                              Live
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{quiz.time}</span>
                          <span className="mx-1">•</span>
                          <span>{quiz.participants} participants</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/quizzes">View All Quizzes</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Your Achievements</CardTitle>
                <CardDescription>Recent badges and certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-edu-muted text-edu-primary mb-2">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <h4 className="font-medium text-sm">Quiz Champion</h4>
                    <p className="text-xs text-muted-foreground">Won 5 quiz battles</p>
                  </div>
                  <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-edu-muted text-edu-primary mb-2">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h4 className="font-medium text-sm">Fast Learner</h4>
                    <p className="text-xs text-muted-foreground">Completed 3 courses</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/achievements">View All Achievements</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Your Courses</CardTitle>
                  <CardDescription>Continue where you left off</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{course.title}</h3>
                        <Badge variant="outline">{course.progress}% Complete</Badge>
                      </div>
                      <Progress value={course.progress} className="h-2 mb-4" />
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1 text-sm">
                          <BookOpen className="h-4 w-4 text-edu-secondary" />
                          <span className="font-medium">Next: {course.nextLesson}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{course.nextLessonTime}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button asChild>
                          <Link to={`/courses/${course.id}`}>Continue</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/courses/enrolled">View All Enrolled Courses</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="mt-1">
                          {activity.type === "completed_lesson" && (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                          {activity.type === "quiz_result" && (
                            <div className="w-8 h-8 rounded-full bg-edu-muted flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-edu-primary" />
                            </div>
                          )}
                          {activity.type === "new_material" && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          {activity.course && (
                            <p className="text-sm text-muted-foreground">
                              {activity.course}
                            </p>
                          )}
                          {activity.score && (
                            <p className="text-sm text-green-600 font-medium">
                              Score: {activity.score}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/activity">View All Activity</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
