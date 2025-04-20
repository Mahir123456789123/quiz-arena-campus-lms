
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useAssignments } from '@/hooks/useAssignments';
import { format } from 'date-fns';

export const DeadlinesCalendar = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: assignments = [], isLoading } = useAssignments(user?.id);

  // Get all dates with deadlines
  const datesWithDeadlines = assignments.map(
    (assignment: any) => new Date(assignment.deadline)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border p-3 pointer-events-auto"
            modifiers={{
              hasDeadline: datesWithDeadlines,
            }}
            modifiersStyles={{
              hasDeadline: { 
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))'
              }
            }}
          />
        </div>
        <div className="flex-1">
          {selectedDate && (
            <div className="space-y-4">
              <h3 className="font-medium">
                Deadlines for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {assignments
                  .filter((assignment: any) => 
                    format(new Date(assignment.deadline), 'yyyy-MM-dd') === 
                    format(selectedDate, 'yyyy-MM-dd')
                  )
                  .map((assignment: any) => (
                    <Card key={assignment.id} className="p-4 ">
                      <div className="space-y-1">
                        <h4 className="font-medium">{assignment.chapter_materials.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {assignment.chapter_materials.chapter.course.title} - 
                          {assignment.chapter_materials.chapter.title}
                        </p>
                        <p className="text-sm">
                          Due: {format(new Date(assignment.deadline), 'h:mm a')}
                        </p>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
