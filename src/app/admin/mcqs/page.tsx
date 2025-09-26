

import { getSubjects, getAllQuizAttempts } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BookCheck, Library, Folder, FileText, PlusCircle, Edit, Trash2, ClipboardCheck, Eye, User, BookCopy } from "lucide-react";
import { iconMap } from "@/lib/iconMap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MCQForm } from "@/components/admin/mcqs/MCQForm";
import { DeleteMCQDialog } from "@/components/admin/mcqs/DeleteMCQDialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
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


const ManageMCQsTab = async () => {
    const subjects = await getSubjects();

    return (
        <>
        {subjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <Library className="h-16 w-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Subjects Found</h2>
                <p>You need to create subjects and chapters before you can add MCQs.</p>
            </div>
            ) : (
            <Accordion type="multiple" className="w-full space-y-4">
                {subjects.map((subject) => {
                const SubjectIcon = iconMap[subject.icon] || Library;
                return (
                    <AccordionItem value={subject.id} key={subject.id} className="border rounded-lg bg-card">
                    <AccordionTrigger className="text-xl font-bold hover:no-underline px-6">
                        <div className="flex items-center gap-3">
                            <SubjectIcon className="h-6 w-6 text-primary" />
                            {subject.name}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6">
                        <Accordion type="multiple" className="w-full space-y-2">
                            {subject.subSubjects && subject.subSubjects.map((subSubject) => {
                            const SubSubjectIcon = (subSubject.icon && iconMap[subSubject.icon]) || Folder;
                            return (
                                <AccordionItem value={subSubject.id} key={subSubject.id} className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-muted/50 px-4 rounded-md">
                                    <div className="flex items-center gap-3">
                                    <SubSubjectIcon className="h-5 w-5 text-primary/80" />
                                    {subSubject.name}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-8 pt-4">
                                    {subSubject.chapters && subSubject.chapters.length > 0 ? (
                                    <div className="space-y-4">
                                        {subSubject.chapters.map(chapter => (
                                            <Card key={chapter.id}>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                <CardTitle className="text-md flex items-center gap-3">
                                                    <FileText className="h-5 w-5" />
                                                    {chapter.name}
                                                </CardTitle>
                                                <MCQForm subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id}>
                                                    <Button size="sm">
                                                            <PlusCircle className="mr-2 h-4 w-4" /> Add MCQ Set
                                                    </Button>
                                                </MCQForm>
                                                </CardHeader>
                                                <CardContent>
                                                    {(chapter.mcqSets && chapter.mcqSets.length > 0) ? (
                                                        <div className="space-y-3">
                                                            {chapter.mcqSets.map((mcqSet) => (
                                                                <div key={mcqSet.id} className="flex justify-between items-center p-3 border rounded-md bg-muted/30">
                                                                    <p className="font-semibold">{mcqSet.name} ({mcqSet.mcqs.length} questions)</p>
                                                                    <div className="flex items-center">
                                                                        <MCQForm subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id} mcqSet={mcqSet}>
                                                                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                                                        </MCQForm>
                                                                        <DeleteMCQDialog subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id} mcqSetId={mcqSet.id} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : <p className="text-sm text-muted-foreground italic text-center py-4">No MCQ sets in this chapter yet.</p>}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    ) : <p className="text-sm text-muted-foreground italic pt-2">No chapters yet for this sub-subject.</p>}
                                </AccordionContent>
                                </AccordionItem>
                            )
                            })}
                        </Accordion>
                    </AccordionContent>
                    </AccordionItem>
                )
                })}
            </Accordion>
            )}
        </>
    )
}

const ViewAttemptsTab = async () => {
    const attempts = await getAllQuizAttempts();
    const timeZone = 'Asia/Kolkata';

    const attemptsByMcqSet = groupAttemptsByMcqSet(attempts);
    const attemptsByUser = groupAttemptsByUser(attempts);

    const sortedMcqSets = Object.values(attemptsByMcqSet).sort((a,b) => a.mcqSetName.localeCompare(b.mcqSetName));
    const sortedUsers = Object.values(attemptsByUser).sort((a,b) => a.userName.localeCompare(b.userName));

    return (
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
    )
}

export default async function AdminMCQsPage() {
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookCheck className="w-8 h-8 text-primary" />
            MCQs Management
        </h1>
        <p className="text-muted-foreground">
          Create, edit, and review Multiple Choice Questions and attempts.
        </p>
      </header>

      <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">
                <Edit className="mr-2 h-4 w-4" />
                Manage MCQs
            </TabsTrigger>
            <TabsTrigger value="attempts">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                View Attempts
            </TabsTrigger>
        </TabsList>
        <TabsContent value="manage" className="mt-6">
            <ManageMCQsTab />
        </TabsContent>
        <TabsContent value="attempts" className="mt-6">
            <ViewAttemptsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

