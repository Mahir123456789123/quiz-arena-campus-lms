
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, FileVideo, File, MessageSquare, Lock } from 'lucide-react';
import ChapterMaterialViewer from './ChapterMaterialViewer';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CourseHeader from './CourseHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DiscussionsTab from './DiscussionsTab';
import { useCompletedMaterials } from '@/hooks/useCompletedMaterials';

const StudentCourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  // Fetch course and its chapters
  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['student_course', courseId],
    queryFn: async () => {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          chapters (
            *,
            chapter_materials (*)
          )
        `)
        .eq('id', courseId)
        .single();
        
      if (courseError) throw courseError;
      return course;
    },
    enabled: !!courseId
  });

  const { completedMaterials, markAsCompleted } = useCompletedMaterials(courseId);

  // Helper function to check if a material is accessible
  const isMaterialAccessible = (chapterIndex: number, materialIndex: number, chapterMaterials: any[]) => {
    if (chapterIndex === 0 && materialIndex === 0) return true;
    
    // Get previous material
    const previousMaterial = materialIndex === 0 
      ? courseData?.chapters[chapterIndex - 1]?.chapter_materials?.slice(-1)[0]
      : chapterMaterials[materialIndex - 1];

    return previousMaterial && completedMaterials.includes(previousMaterial.id);
  };

  if (isLoadingCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <CourseHeader course={courseData} />
      
      <Tabs defaultValue="content" className="mt-6">
        <TabsList>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Discussions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              {courseData?.chapters && courseData.chapters.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-3">
                  {courseData.chapters.map((chapter: any, chapterIndex: number) => (
                    <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-md overflow-hidden">
                      <div className="bg-card">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-start gap-2 text-left">
                            <div>
                              <h3 className="font-medium">
                                Chapter {chapterIndex + 1}: {chapter.title}
                              </h3>
                              {chapter.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {chapter.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                      </div>
                      <AccordionContent className="px-4 pb-4 pt-2">
                        {chapter.chapter_materials && chapter.chapter_materials.length > 0 ? (
                          <div className="space-y-3">
                            {chapter.chapter_materials.map((material: any, materialIndex: number) => {
                              const isAccessible = isMaterialAccessible(chapterIndex, materialIndex, chapter.chapter_materials);
                              const isCompleted = completedMaterials.includes(material.id);

                              if (!isAccessible) {
                                return (
                                  <Card key={material.id} className="bg-muted/50">
                                    <CardHeader className="p-4">
                                      <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                                        <Lock className="h-4 w-4" />
                                        {material.title}
                                        <span className="text-sm text-muted-foreground ml-2">
                                          (Complete previous material to unlock)
                                        </span>
                                      </CardTitle>
                                    </CardHeader>
                                  </Card>
                                );
                              }

                              return (
                                <ChapterMaterialViewer 
                                  key={material.id}
                                  material={material}
                                  onComplete={() => markAsCompleted(material.id)}
                                  isCompleted={isCompleted}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              No materials in this chapter yet
                            </p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No chapters yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The instructor hasn't added any content to this course yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussions">
          <DiscussionsTab courseId={courseId || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCourseView;
