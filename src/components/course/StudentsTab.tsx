
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserCircle, MessageSquare, Users } from 'lucide-react';

interface StudentsTabProps {
  enrollments: any[];
  isLoading: boolean;
}

const StudentsTab = ({ enrollments, isLoading }: StudentsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Students</CardTitle>
        <CardDescription>Manage students enrolled in this course</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading students...</p>
          </div>
        ) : enrollments?.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No students enrolled</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your course code so students can enroll.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments?.map((enrollment: any) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {enrollment.student.avatar_url ? (
                        <img 
                          src={enrollment.student.avatar_url} 
                          alt={enrollment.student.full_name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                      )}
                      <span>{enrollment.student.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsTab;
