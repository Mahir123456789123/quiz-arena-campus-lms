"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/integrations/supabase/client"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Clock, BarChart3, PlayCircle, Video, LineChart, Zap, Activity, Brain } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useEnrollments } from "@/hooks/useEnrollments"
import PomodoroTimer from "@/components/dashboard/PomodoroTimer"
import TodoList from "@/components/dashboard/TodoList"
import { useScheduledMeetings, type ScheduledMeeting } from "@/hooks/useScheduledMeetings"
import PerformanceRadarChart from "@/components/analytics/PerformanceRadarChart"
import CompletionProgressChart from "@/components/analytics/CompletionProgressChart"
import LearningDNAChart from "@/components/analytics/LearningDNAChart"
import PerformancePrediction from "@/components/analytics/PerformancePrediction"
import ActivityHeatmap from "@/components/analytics/ActivityHeatmap"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const StudentDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courseCode, setCourseCode] = useState("")
  const [meetingCode, setMeetingCode] = useState("")
  const { data: enrollments = [], refetch: refetchEnrollments } = useEnrollments()
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false)
  const { meetings, isLoading: isLoadingMeetings } = useScheduledMeetings()

  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseCode.trim()) {
      toast.error("Please enter a course code")
      return
    }

    setIsLoadingCourse(true)

    try {
      const { data: courses, error: courseError } = await supabase
        .from("courses")
        .select("id, title, code")
        .ilike("code", courseCode.trim())

      if (courseError) throw courseError

      if (!courses || courses.length === 0) {
        toast.error("Course not found. Please check the code and try again.")
        return
      }

      const course = courses[0]

      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user?.id)
        .eq("course_id", course.id)

      if (enrollmentCheckError) throw enrollmentCheckError

      if (existingEnrollment && existingEnrollment.length > 0) {
        toast.error("You are already enrolled in this course")
        return
      }

      const { error: enrollError } = await supabase.from("enrollments").insert({
        student_id: user?.id,
        course_id: course.id,
      })

      if (enrollError) throw enrollError

      toast.success(`Successfully enrolled in "${course.title}"`)
      setCourseCode("")
      refetchEnrollments()
    } catch (error: any) {
      toast.error(error.message || "Failed to join course")
    } finally {
      setIsLoadingCourse(false)
    }
  }

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetingCode.trim()) {
      toast.error("Please enter a meeting code")
      return
    }

    setIsLoadingMeeting(true)

    try {
      // Navigate to the meeting room
      navigate(`/meeting/${meetingCode.trim()}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to join meeting")
      setIsLoadingMeeting(false)
    }
  }

  // Format date for display
  const formatDateTime = (date: string, time: string) => {
    const formattedDate = new Date(date).toLocaleDateString()
    return `${formattedDate} at ${time}`
  }

  // Check if meeting is upcoming (today or in the future)
  const isUpcomingMeeting = (meeting: ScheduledMeeting) => {
    const meetingDate = new Date(meeting.scheduled_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return meetingDate >= today
  }

  // Filter upcoming meetings
  const upcomingMeetings = meetings.filter(isUpcomingMeeting)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/90">
      <Navbar />
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your progress and manage your courses</p>
        </div>
  
        <Tabs defaultValue="dashboard" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Performance</TabsTrigger>
          </TabsList>
  
          <TabsContent value="dashboard">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* First row */}
              <Card className="border border-border shadow-sm dark:border-slate-700 hover:shadow-md transition-all md:col-span-1 lg:col-span-1">
                <PomodoroTimer />
              </Card>
  
              <Card className="border border-border shadow-sm dark:border-slate-700 hover:shadow-md transition-all md:col-span-1 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <BookOpen className="h-5 w-5 text-primary dark:text-primary" />
                    Join a Course
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoinCourse} className="space-y-3">
                    <Input
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="Enter course code"
                      className="w-full bg-background dark:bg-slate-800 border-input"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoadingCourse} 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isLoadingCourse ? "Joining..." : "Join Course"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
  
              <Card className="border border-border shadow-sm dark:border-slate-700 hover:shadow-md transition-all md:col-span-1 lg:col-span-1">
                <TodoList />
              </Card>
  
              <Card className="border border-border shadow-sm dark:border-slate-700 hover:shadow-md transition-all md:col-span-1 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <Video className="h-5 w-5 text-primary dark:text-primary" />
                    Upcoming Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLoadingMeetings ? (
                      <p className="text-muted-foreground">Loading meetings...</p>
                    ) : upcomingMeetings.length > 0 ? (
                      upcomingMeetings.slice(0, 2).map((meeting) => (
                        <div
                          key={meeting.id}
                          className="flex justify-between items-center border-b pb-2 mb-2 border-border dark:border-slate-700"
                        >
                          <div>
                            <p className="font-medium text-sm text-foreground">{meeting.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(meeting.scheduled_date, meeting.scheduled_time)}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => navigate(`/meeting/${meeting.room_id}`)}
                            className="border-border hover:bg-accent hover:text-accent-foreground dark:border-slate-600"
                          >
                            Join
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No upcoming meetings scheduled</p>
                    )}
  
                    <form onSubmit={handleJoinMeeting} className="space-y-2 mt-3 pt-2 border-t border-border dark:border-slate-700">
                      <p className="text-xs font-medium text-foreground">Join with meeting code</p>
                      <div className="flex space-x-2">
                        <Input
                          value={meetingCode}
                          onChange={(e) => setMeetingCode(e.target.value)}
                          placeholder="Enter code"
                          className="text-sm bg-background dark:bg-slate-800 border-input"
                          size={20}
                        />
                        <Button 
                          type="submit" 
                          size="sm" 
                          disabled={isLoadingMeeting}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Join
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
  
              {/* Second row */}
              <Card className="border border-border shadow-sm dark:border-slate-700 hover:shadow-md transition-all md:col-span-2 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <Activity className="h-5 w-5 text-primary dark:text-primary" />
                    Performance Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CompletionProgressChart />
                </CardContent>
              </Card>
  
              <Card className="border border-border shadow-sm dark:border-slate-700 hover:shadow-md transition-all md:col-span-2 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <Zap className="h-5 w-5 text-primary dark:text-primary" />
                    Performance Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformancePrediction />
                </CardContent>
              </Card>
  
              {/* Third row */}
              <Card className="border border-border shadow-sm dark:border-slate-700 hover:shadow-md transition-all md:col-span-2 lg:col-span-4">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <BookOpen className="h-5 w-5 text-primary dark:text-primary" />
                    My Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {enrollments.length > 0 ? (
                      enrollments.map((enrollment: any) => (
                        <Card key={enrollment.id} className="bg-card dark:bg-slate-800 border border-border dark:border-slate-700 hover:shadow-md transition-shadow">
                          <CardHeader className="p-3">
                            <CardTitle className="text-base font-medium text-foreground">{enrollment.course.title}</CardTitle>
                            <CardDescription>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span>Last accessed: Recently</span>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              asChild 
                              className="gap-1 w-full justify-start hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-700"
                            >
                              <Link to={`/courses/${enrollment.course.id}`}>
                                <PlayCircle className="h-4 w-4" />
                                Continue Learning
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-3">No courses enrolled yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {/* Top row - full width Strengths & Weaknesses */}
              <Card className="border shadow-md hover:shadow-lg transition-all lg:col-span-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-950 dark:to-blue-950">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-6 w-6 text-cyan-500" />
                    Strengths & Weaknesses
                  </CardTitle>
                  <CardDescription>Analysis of your performance across different skills</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <PerformanceRadarChart />
                </CardContent>
              </Card>

              {/* Middle row - 2 cards */}
              <Card className="border shadow-md hover:shadow-lg transition-all lg:col-span-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950 dark:to-teal-950">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LineChart className="h-5 w-5 text-emerald-500" />
                    Your Learning Journey
                  </CardTitle>
                  <CardDescription> </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <div className="flex flex-col h-full justify-center items-center space-y-4">
                    <div className="text-center bg-card p-3 rounded-lg w-full shadow-sm">
                      <p className="text-xl font-bold">55 hours</p>
                      <p className="text-sm text-muted-foreground">Total learning time this semester</p>
                    </div>
                    <div className="text-center bg-card p-3 rounded-lg w-full shadow-sm">
                      <p className="text-xl font-bold">92%</p>
                      <p className="text-sm text-muted-foreground">Average completion rate</p>
                    </div>
                    <div className="text-center bg-card p-3 rounded-lg w-full shadow-sm">
                      <p className="text-xl font-bold">15</p>
                      <p className="text-sm text-muted-foreground">Topics mastered</p>
                    </div>
                    <p className="text-sm font-medium bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full">
                      "You're in the top 15% of active learners!"
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-md hover:shadow-lg transition-all lg:col-span-2 bg-gradient-to-r from-purple-500/10 to-violet-500/10 dark:from-purple-950 dark:to-violet-950">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Learning DNA
                  </CardTitle>
                  <CardDescription>Your unique learning style and patterns</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <LearningDNAChart />
                </CardContent>
              </Card>

              {/* Bottom row */}
              <Card className="border shadow-md hover:shadow-lg transition-all lg:col-span-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-950 dark:to-indigo-950">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Activity Patterns
                  </CardTitle>
                  <CardDescription>Your engagement patterns over time</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ActivityHeatmap />
                </CardContent>
              </Card>

              <Card className="border shadow-md hover:shadow-lg transition-all lg:col-span-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-950 dark:to-yellow-950">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Predictive Insights
                  </CardTitle>
                  <CardDescription>AI-powered predictions based on your learning patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Card className="bg-card hover:bg-muted/50 transition-colors">
                      <CardHeader className="p-3">
                        <CardTitle className="text-base font-medium">Data Structures</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm">
                          On track to score{" "}
                          <span className="font-bold text-emerald-500 dark:text-emerald-400">above 80%</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Recommendation: Review hash tables</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card hover:bg-muted/50 transition-colors">
                      <CardHeader className="p-3">
                        <CardTitle className="text-base font-medium">Machine Learning</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm">
                          Practice needed -{" "}
                          <span className="font-bold text-amber-500 dark:text-amber-400">potential 70-75%</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Recommendation: Focus on neural networks</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card hover:bg-muted/50 transition-colors">
                      <CardHeader className="p-3">
                        <CardTitle className="text-base font-medium">Web Development</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm">
                          Excellent progress! Prediction:{" "}
                          <span className="font-bold text-green-500 dark:text-green-400">90%+</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Recommendation: Explore advanced topics</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

export default StudentDashboard
