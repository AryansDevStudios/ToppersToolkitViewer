

"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Users, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User, QuestionOfTheDay, UserQotdAnswer } from "@/lib/types";
import { getAllQotdAnswers, getUsers } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QotdAnswersDialogProps {
  question: QuestionOfTheDay;
  users: User[];
  answerCount: number;
}

interface AnswerDetails {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: User['role'];
    hasFullNotesAccess?: boolean;
    selectedOption: string;
    isCorrect: boolean;
}

const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
};

const UserAvatar = ({ user }: { user: AnswerDetails }) => {
  const ringClasses = cn("ring-2", {
    "ring-orange-500": user.userRole === 'Admin',
    "ring-green-500": user.userRole !== 'Admin' && user.hasFullNotesAccess,
    "ring-sky-500": user.userRole !== 'Admin' && !user.hasFullNotesAccess,
  });

  return (
    <Avatar className={ringClasses}>
      <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
    </Avatar>
  );
};


export function QotdAnswersDialog({ question, users: initialUsers, answerCount }: QotdAnswersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<AnswerDetails[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      const fetchAnswers = async () => {
        setIsLoading(true);
        try {
          const [allUserAnswers, allUsers] = await Promise.all([
             getAllQotdAnswers(),
             getUsers()
          ]);
          console.log("QOTD Dialog: Fetched allUserAnswers", allUserAnswers);
          console.log("QOTD Dialog: Fetched allUsers", allUsers);

          const relevantAnswers: AnswerDetails[] = [];
          const userMap = new Map(allUsers.map(u => [u.id, u]));

          allUserAnswers.forEach(userAnswerDoc => {
            if (userAnswerDoc && Array.isArray(userAnswerDoc.answers)) {
                const answerForThisQuestion = userAnswerDoc.answers.find(a => a.questionId === question.id);
                if (answerForThisQuestion) {
                  const user = userMap.get(userAnswerDoc.userId);
                  if (user) {
                    relevantAnswers.push({
                      userId: user.id,
                      userName: user.name,
                      userEmail: user.email,
                      userRole: user.role,
                      hasFullNotesAccess: user.hasFullNotesAccess,
                      selectedOption: question.options[answerForThisQuestion.selectedOptionIndex]?.text || 'Invalid Option',
                      isCorrect: answerForThisQuestion.isCorrect,
                    });
                  } else {
                     console.warn("QOTD Dialog: Could not find user with ID:", userAnswerDoc.userId);
                  }
                }
            }
          });
          
          console.log("QOTD Dialog: Found relevant answers:", relevantAnswers);
          setAnswers(relevantAnswers);

        } catch (error) {
          console.error("QOTD Dialog: Error fetching answers:", error);
          toast({ title: "Error", description: "Failed to fetch answers.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnswers();
    }
  }, [isOpen, question, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="h-9 w-9 relative">
            <Users className="h-4 w-4" />
            <span className="sr-only">View Answers</span>
            {answerCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {answerCount}
                </span>
            )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Answers for "{question.question}"</DialogTitle>
          <DialogDescription>
            List of users who have answered this question.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : answers.length > 0 ? (
                <ul className="space-y-3">
                    {answers.map((answer) => (
                        <li key={answer.userId} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <UserAvatar user={answer} />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{answer.userName}</p>
                                <p className="text-xs text-muted-foreground">{answer.selectedOption}</p>
                            </div>
                            <Badge variant={answer.isCorrect ? "default" : "destructive"} className="gap-1.5 pl-2 pr-2.5 py-1">
                                {answer.isCorrect 
                                    ? <CheckCircle2 className="h-3.5 w-3.5"/> 
                                    : <XCircle className="h-3.5 w-3.5" />
                                }
                                {answer.isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <Users className="h-12 w-12 mb-4" />
                    <p className="font-semibold">No one has answered this question yet.</p>
                </div>
            )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
