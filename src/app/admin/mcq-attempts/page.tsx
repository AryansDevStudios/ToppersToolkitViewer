
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
import { ClipboardCheck, Eye, User, BookCopy } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { QuizAttempt } from "@/lib/types";

export const revalidate = 0;

const groupAttemptsByMcqSet = (attempts: QuizAttempt[]) => {
    return attempts.reduce((acc, attempt) => {
        if (!acc[attempt.mcqSetId]) {
            acc[attempt.mcqSetId] = { mcqSetName: attempt.mcqSetName, attempts: [] };
        }
        acc[attempt.mcqSetId].attempts.push(attempt);
        return acc;
    }, {} as Record<string, { mcqSetName: string; attempts: QuizAttempt[] }>);
};

const groupAttemptsByUser = (attempts: QuizAttempt[]) => {
    return attempts.reduce((acc, attempt) => {
        if (!acc[attempt.userId]) {
            acc[attempt.userId] = { userName: attempt.userName, attempts: [] };
        }
        acc[attempt.userId].attempts.push(attempt);
        return acc;
    }, {} as Record<string, { userName: string; attempts: QuizAttempt[] }>);
};


export default async function AdminMCQAttemptsPage() {
  const attempts = await getAllQuizAttempts();
  const timeZone = 'Asia/Kolkata';

  const attemptsByMcqSet = groupAttemptsByMcqSet(attempts);
  const attemptsByUser = groupAttemptsByUser(attempts);

  const sortedMcqSets = Object.values(attemptsByMcqSet).sort((a,b) => a.mcqSetName.localeCompare(b.mcqSetName));
  const sortedUsers = Object.values(attemptsByUser).sort((a,b) => a.userName.localeCompare(b.userName));


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
      
      <Tabs defaultValue="mcq">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mcq">
            <BookCopy className="mr-2 h-4 w-4" />
            MCQ Perspective
          </TabsTrigger>
          <TabsTrigger value="user">
            <User className="mr-2 h-4 w-4" />
            User Perspective
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mcq" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Attempts by MCQ Set</CardTitle>
                    <CardDescription>Each quiz and all the users who attempted it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full">
                        {sortedMcqSets.map(({ mcqSetName, attempts: setAttempts }) => (
                            <AccordionItem value={mcqSetName} key={mcqSetName}>
                                <AccordionTrigger className="text-lg font-semibold">
                                    {mcqSetName} ({setAttempts.length} attempts)
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead className="text-center">Score</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {setAttempts.sort((a,b) => b.createdAt - a.createdAt).map(attempt => (
                                                <TableRow key={attempt.id}>
                                                    <TableCell>{attempt.userName}</TableCell>
                                                    <TableCell className="text-center">{attempt.score}/{attempt.totalQuestions}</TableCell>
                                                    <TableCell>{format(toZonedTime(new Date(attempt.createdAt), timeZone), 'PPP p')}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/quiz-results/${attempt.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />View</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    {sortedMcqSets.length === 0 && <p className="text-center text-muted-foreground py-16">No quiz attempts found.</p>}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="user" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Attempts by User</CardTitle>
                    <CardDescription>Each user and all the quizzes they've attempted.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="multiple" className="w-full">
                        {sortedUsers.map(({ userName, attempts: userAttempts }) => (
                            <AccordionItem value={userName} key={userName}>
                                <AccordionTrigger className="text-lg font-semibold">
                                    {userName} ({userAttempts.length} attempts)
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Quiz</TableHead>
                                                <TableHead className="text-center">Score</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {userAttempts.sort((a,b) => b.createdAt - a.createdAt).map(attempt => (
                                                <TableRow key={attempt.id}>
                                                    <TableCell>{attempt.mcqSetName}</TableCell>
                                                    <TableCell className="text-center">{attempt.score}/{attempt.totalQuestions}</TableCell>
                                                    <TableCell>{format(toZonedTime(new Date(attempt.createdAt), timeZone), 'PPP p')}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/quiz-results/${attempt.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />View</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                     {sortedUsers.length === 0 && <p className="text-center text-muted-foreground py-16">No quiz attempts found.</p>}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
