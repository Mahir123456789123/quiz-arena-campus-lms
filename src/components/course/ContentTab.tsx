
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { PlusCircle, BookOpen } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ChapterMaterialForm from './ChapterMaterialForm';
import ChapterMaterialViewer from './ChapterMaterialViewer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2 } from 'lucide-react';

interface ContentTabProps {
  chapters: any[];
  createChapter: (data: { title: string; description: string }) => void;
  deleteChapter: (id: string) => void;
  addMaterial: (chapterId: string) => string;
  deleteMaterial: (id: string) => void;
}

const ContentTab = ({ 
  chapters, 
  createChapter, 
  deleteChapter, 
  addMaterial, 
  deleteMaterial 
}: ContentTabProps) => {
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  
  const chapterForm = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  });

  const handleCreateChapter = (data: { title: string; description: string }) => {
    createChapter(data);
    setShowChapterForm(false);
    chapterForm.reset();
  };

  const handleAddMaterial = (chapterId: string) => {
    setActiveChapter(chapterId);
    setShowMaterialForm(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Content</CardTitle>
        <CardDescription>Manage chapters and learning materials for this course</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showChapterForm ? (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <Form {...chapterForm}>
                  <form onSubmit={chapterForm.handleSubmit(handleCreateChapter)} className="space-y-4">
                    <FormField
                      control={chapterForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chapter Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter chapter title" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={chapterForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter chapter description" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Create Chapter</Button>
                      <Button type="button" variant="outline" onClick={() => setShowChapterForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setShowChapterForm(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Chapter
            </Button>
          )}

          {chapters.length === 0 ? (
            <div className="text-center p-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No chapters yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by adding your first chapter to this course.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {chapters.map((chapter: any, index: number) => (
                <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-md overflow-hidden">
                  <div className="bg-card">
                    <div className="flex justify-between items-start px-4 py-3">
                      <div className="flex-1">
                        <AccordionTrigger className="hover:no-underline py-0">
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
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddMaterial(chapter.id);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Material
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the chapter and all its content.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteChapter(chapter.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                  <AccordionContent className="px-4 pb-4 pt-2">
                    {showMaterialForm && activeChapter === chapter.id ? (
                      <ChapterMaterialForm 
                        chapterId={chapter.id}
                        onSuccess={() => {
                          setShowMaterialForm(false);
                          setActiveChapter(null);
                        }}
                        onCancel={() => {
                          setShowMaterialForm(false);
                          setActiveChapter(null);
                        }}
                      />
                    ) : (
                      <>
                        {chapter.chapter_materials && chapter.chapter_materials.length > 0 ? (
                          <div className="space-y-3">
                            {chapter.chapter_materials.map((material: any) => (
                              <ChapterMaterialViewer 
                                key={material.id}
                                material={material}
                                onDelete={deleteMaterial}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              No materials in this chapter yet
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => handleAddMaterial(chapter.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Material
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentTab;
