
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, FileVideo, File } from 'lucide-react';
import ChapterMaterialViewer from './ChapterMaterialViewer';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CourseHeader from './CourseHeader';

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
      
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          {courseData?.chapters && courseData.chapters.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-3">
              {courseData.chapters.map((chapter: any, index: number) => (
                <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-md overflow-hidden">
                  <div className="bg-card">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-start gap-2 text-left">
                        <div>
                          <h3 className="font-medium">
                            Chapter {index + 1}: {chapter.title}
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
                        {chapter.chapter_materials.map((material: any) => (
                          <ChapterMaterialViewer 
                            key={material.id}
                            material={material}
                            onDelete={() => {}} // Students can't delete materials
                          />
                        ))}
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
    </div>
  );
};

export default StudentCourseView;
