
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle, Check, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { submitUserAnswer, getUserQotdAnswer } from "@/lib/data";
import type { QuestionOfTheDay, UserQotdAnswer, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";

interface QuestionOfTheDaySectionProps {
  initialQuestion: QuestionOfTheDay;
  initialUser: User | null;
}

export function QuestionOfTheDaySection({ initialQuestion, initialUser }: QuestionOfTheDaySectionProps) {
  const { user, dbUser: authDbUser, loading: authLoading } = useAuth();
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAnswer, setUserAnswer] = useState<UserQotdAnswer | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Use the authenticated user's data if available, otherwise fall back to the initial server-rendered user data
  const dbUser = authDbUser || initialUser;
  
  useEffect(() => {
    async function fetchUserAnswer() {
      if (!user) {
        setIsLoadingAnswer(false);
        return;
      }
      setIsLoadingAnswer(true);
      const answer = await getUserQotdAnswer(user.uid, initialQuestion.id);
      setUserAnswer(answer);
      setIsLoadingAnswer(false);
    }
    fetchUserAnswer();
  }, [user, initialQuestion.id]);


  const handleSubmit = async () => {
    if (!user || !initialQuestion || selectedOptionIndex === null) return;

    setIsSubmitting(true);
    const result = await submitUserAnswer(
      user.uid,
      initialQuestion.id,
      selectedOptionIndex
    );
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: result.isCorrect ? "Correct!" : "Incorrect",
        description: result.isCorrect
          ? "+10 points awarded to you on the leaderboard!"
          : "Better luck next time!",
        variant: result.isCorrect ? "default" : "destructive",
      });
      // Fetch the new answer to update the UI
      const newAnswer = await getUserQotdAnswer(user.uid, initialQuestion.id);
      setUserAnswer(newAnswer);
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    const hasAnswered = !!userAnswer;
    const correctIndex = hasAnswered ? (userAnswer.isCorrect ? userAnswer.selectedOptionIndex : initialQuestion.correctOptionIndex) : null;
    const selectedIndex = userAnswer?.selectedOptionIndex;

    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
             {initialQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {initialQuestion.options.map((option, index) => {
            const isSelected = selectedOptionIndex === index;
            const isCorrect = hasAnswered && index === correctIndex;
            const isWrong = hasAnswered && index === selectedIndex && !isCorrect;

            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full justify-start h-auto py-3 text-left whitespace-normal",
                  isSelected && !hasAnswered && "ring-2 ring-primary",
                  isCorrect && "bg-green-100 border-green-300 text-green-900 hover:bg-green-200 dark:bg-green-900/50 dark:border-green-700 dark:text-green-100",
                  isWrong && "bg-red-100 border-red-300 text-red-900 hover:bg-red-200 dark:bg-red-900/50 dark:border-red-700 dark:text-red-100"
                )}
                onClick={() => !hasAnswered && setSelectedOptionIndex(index)}
                disabled={hasAnswered || isSubmitting}
              >
                <div className="flex items-center w-full">
                    <span className="flex-1">{option.text}</span>
                    {isCorrect && <Check className="h-5 w-5 ml-4" />}
                    {isWrong && <X className="h-5 w-5 ml-4" />}
                </div>
              </Button>
            );
          })}
        </CardContent>
        {!hasAnswered && (
             <CardFooter className="flex-col sm:flex-row items-center justify-end gap-4">
              <Button
                onClick={handleSubmit}
                disabled={selectedOptionIndex === null || isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </CardFooter>
        )}
      </>
    );
  };

  if (authLoading || isLoadingAnswer) {
      return (
        <Card>
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </Card>
      );
  }

  return (
    <Card>
        {user ? (
            renderContent()
        ) : (
            <div className="text-center text-muted-foreground h-48 flex flex-col justify-center items-center">
                <ShieldCheck className="h-10 w-10 mb-2" />
                <p className="font-semibold">Questions are available for users.</p>
                <p>Please log in or register to participate.</p>
            </div>
        )}
    </Card>
  );
}

    