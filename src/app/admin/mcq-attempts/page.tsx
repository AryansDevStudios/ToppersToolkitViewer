
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllQuizAttempts } from "@/lib/data";
import Link from "next/link";
import { ClipboardCheck, Eye } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';

export const revalidate = 0;

export default async function AdminMCQAttemptsPage() {
  const attempts = await getAllQuizAttempts();
  const timeZone = 'Asia/Kolkata';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-8 h-8 text-primary" />
          MCQ Attempts
        </h1>
        <p className="text-muted-foreground">
          Review all quiz attempts submitted by users.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Attempts</CardTitle>
          <CardDescription>A log of all completed quizzes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Quiz Name</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt) => {
                const zonedDate = toZonedTime(new Date(attempt.createdAt), timeZone);
                const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                return (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div className="font-medium">{attempt.userName}</div>
                    </TableCell>
                    <TableCell>
                      <div>{attempt.mcqSetName}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {attempt.score}/{attempt.totalQuestions} ({percentage}%)
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(zonedDate, 'PPP p')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/quiz-results/${attempt.id}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {attempts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No quiz attempts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
