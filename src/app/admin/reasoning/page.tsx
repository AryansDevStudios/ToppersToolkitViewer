
import { getReasoningSets, getAllReasoningQuizAttempts } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BrainCircuit, Edit, ClipboardCheck, BookCopy, User, Eye } from "lucide-react";
import { format } from 'date-fns';
import type { ReasoningSet, ReasoningQuizAttempt } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { DeleteReasoningDialog } from "@/components/admin/reasoning/DeleteReasoningDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toZonedTime } from "date-fns-tz";


export const revalidate = 0;

const ManageSetsTab = async ({ sets }: { sets: ReasoningSet[] }) => (
    <>
      <div className="flex justify-end mb-6">
        <Button asChild>
            <Link href="/admin/reasoning/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Set
            </Link>
        </Button>
      </div>
      {sets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <BrainCircuit className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Reasoning Sets Found</h2>
          <p className="mb-6">Get started by creating your first quiz set.</p>
           <Button asChild>
            <Link href="/admin/reasoning/new">Create Your First Set</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <Card key={set.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{set.name}</CardTitle>
                <CardDescription>
                  {set.mcqs.length} questions
                </CardDescription>
              </CardHeader>
               <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                      Created on: {format(new Date(set.createdAt), 'PPP')}
                  </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 bg-muted/30 p-3">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/reasoning/edit/${set.id}`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                </Button>
                <DeleteReasoningDialog setId={set.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
);

const groupAttemptsBySet = (attempts: ReasoningQuizAttempt[]) => {
    return attempts.reduce((acc, attempt) => {
        if (!acc[attempt.setId]) {
            acc[attempt.setId] = { setName: attempt.setName, attempts: [] };
        }
        acc[attempt.setId].attempts.push(attempt);
        return acc;
    }, {} as Record<string, { setName: string; attempts: ReasoningQuizAttempt[] }>);
};

const groupAttemptsByUser = (attempts: ReasoningQuizAttempt[]) => {
    return attempts.reduce((acc, attempt) => {
        if (!acc[attempt.userId]) {
            acc[attempt.userId] = { userName: attempt.userName, attempts: [] };
        }
        acc[attempt.userId].attempts.push(attempt);
        return acc;
    }, {} as Record<string, { userName: string; attempts: ReasoningQuizAttempt[] }>);
};

const ViewAttemptsTab = async ({ attempts }: { attempts: ReasoningQuizAttempt[] }) => {
    const timeZone = 'Asia/Kolkata';

    const attemptsBySet = groupAttemptsBySet(attempts);
    const attemptsByUser = groupAttemptsByUser(attempts);

    const sortedSets = Object.values(attemptsBySet).sort((a,b) => a.setName.localeCompare(b.setName));
    const sortedUsers = Object.values(attemptsByUser).sort((a,b) => a.userName.localeCompare(b.userName));

    return (
        <Tabs defaultValue="set">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="set"><BookCopy className="mr-2 h-4 w-4" />Set Perspective</TabsTrigger>
                <TabsTrigger value="user"><User className="mr-2 h-4 w-4" />User Perspective</TabsTrigger>
            </TabsList>
            <TabsContent value="set" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Attempts by Quiz Set</CardTitle>
                        <CardDescription>Each quiz and all the users who attempted it.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" className="w-full">
                            {sortedSets.map(({ setName, attempts: setAttempts }) => (
                                <AccordionItem value={setName} key={setName}>
                                    <AccordionTrigger className="text-lg font-semibold">{setName} ({setAttempts.length} attempts)</AccordionTrigger>
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
                                                {setAttempts.sort((a, b) => b.createdAt - a.createdAt).map(attempt => (
                                                    <TableRow key={attempt.id}>
                                                        <TableCell>{attempt.userName}</TableCell>
                                                        <TableCell className="text-center">{attempt.score}/{attempt.totalQuestions}</TableCell>
                                                        <TableCell>{format(toZonedTime(new Date(attempt.createdAt), timeZone), 'PPP p')}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/reasoning-results/${attempt.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />View</Link>
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
                        {sortedSets.length === 0 && <p className="text-center text-muted-foreground py-16">No quiz attempts found.</p>}
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
                                    <AccordionTrigger className="text-lg font-semibold">{userName} ({userAttempts.length} attempts)</AccordionTrigger>
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
                                                        <TableCell>{attempt.setName}</TableCell>
                                                        <TableCell className="text-center">{attempt.score}/{attempt.totalQuestions}</TableCell>
                                                        <TableCell>{format(toZonedTime(new Date(attempt.createdAt), timeZone), 'PPP p')}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/reasoning-results/${attempt.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />View</Link>
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
};

export default async function AdminReasoningPage() {
  const [sets, allAttempts] = await Promise.all([
    getReasoningSets(),
    getAllReasoningQuizAttempts(),
  ]);

  return (
    <div className="space-y-8">
      <header>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-primary" />
            Reasoning Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and review Reasoning quizzes and attempts.
          </p>
      </header>
      
      <Tabs defaultValue="manage">
          <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage"><Edit className="mr-2 h-4 w-4" />Manage Sets</TabsTrigger>
              <TabsTrigger value="attempts"><ClipboardCheck className="mr-2 h-4 w-4" />View Attempts</TabsTrigger>
          </TabsList>
          <TabsContent value="manage" className="mt-6">
              <ManageSetsTab sets={sets} />
          </TabsContent>
           <TabsContent value="attempts" className="mt-6">
              <ViewAttemptsTab attempts={allAttempts} />
          </TabsContent>
      </Tabs>
    </div>
  );
}
