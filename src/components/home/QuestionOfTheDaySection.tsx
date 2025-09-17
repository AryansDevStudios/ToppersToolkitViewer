
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
import { getQuestionOfTheDay, submitUserAnswer } from "@/lib/data";
import type { QuestionOfTheDay, UserQotdAnswer } from "@/lib/types";
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
import { format } from "date-fns";

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function QuestionOfTheDaySection() {
  const { user, dbUser, loading: authLoading } = useAuth();
  const [question, setQuestion] = useState<QuestionOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<{
    selectedId: string;
    correctId: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const userAnswer = dbUser?.qotdAnswers?.find(
    (ans) => ans.questionId === question?.id
  );

  useEffect(() => {
    async function fetchQuestion() {
      setLoading(true);
      const today = getTodayDateString();
      const q = await getQuestionOfTheDay(today);
      setQuestion(q);
      setLoading(false);
    }
    fetchQuestion();
  }, []);

  const handleSubmit = async () => {
    if (!user || !question || !selectedOptionId) return;

    setIsSubmitting(true);
    const result = await submitUserAnswer(
      user.uid,
      question.id,
      selectedOptionId
    );
    setIsSubmitting(false);

    if (result.success) {
      setSubmittedAnswer({
        selectedId: selectedOptionId,
        correctId: result.correctOptionId!,
      });
      toast({
        title: result.isCorrect ? "Correct!" : "Incorrect",
        description: result.isCorrect
          ? "+10 points awarded to you on the leaderboard!"
          : "Better luck next time!",
        variant: result.isCorrect ? "default" : "destructive",
      });
      // Refresh router to get updated user data (dbUser)
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
    if (loading || authLoading) {
      return (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!question) {
      return (
        <div className="text-center text-muted-foreground h-48 flex flex-col justify-center items-center">
          <HelpCircle className="h-10 w-10 mb-2" />
          <p className="font-semibold">No question available for today.</p>
          <p>Please check back tomorrow!</p>
        </div>
      );
    }

    const hasAnswered = !!userAnswer || !!submittedAnswer;
    const correctId = userAnswer?.isCorrect
      ? userAnswer.selectedOptionId
      : submittedAnswer?.correctId ||
        (userAnswer && !userAnswer.isCorrect ? question.correctOptionId : null);
    const selectedId =
      userAnswer?.selectedOptionId || submittedAnswer?.selectedId;

    const totalAnswers = dbUser?.qotdAnswers?.length || 0;
    const correctAnswers =
      dbUser?.qotdAnswers?.filter((a) => a.isCorrect).length || 0;

    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="text-primary" /> Question of the Day
          </CardTitle>
          <CardDescription>{question.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = hasAnswered && option.id === correctId;
            const isWrong =
              hasAnswered && option.id === selectedId && !isCorrect;

            return (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "w-full justify-start h-auto py-3 text-left whitespace-normal",
                  isSelected && !hasAnswered && "ring-2 ring-primary",
                  isCorrect && "bg-green-100 border-green-300 text-green-900 hover:bg-green-200 dark:bg-green-900/50 dark:border-green-700 dark:text-green-100",
                  isWrong && "bg-red-100 border-red-300 text-red-900 hover:bg-red-200 dark:bg-red-900/50 dark:border-red-700 dark:text-red-100"
                )}
                onClick={() => !hasAnswered && setSelectedOptionId(option.id)}
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
        <CardFooter className="flex-col sm:flex-row items-center justify-between gap-4">
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost">
                Your Stats: {correctAnswers} / {totalAnswers} Correct
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Your Question History</AlertDialogTitle>
                    <AlertDialogDescription>
                        Here's a summary of all the daily questions you've answered.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-60 overflow-y-auto pr-4">
                    <ul className="space-y-2 text-sm">
                        {dbUser?.qotdAnswers?.map(ans => (
                            <li key={ans.questionId} className="flex items-center gap-2">
                                {ans.isCorrect ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                                <span>Answered on {new Date(ans.answeredAt).toLocaleDateString()} - {ans.isCorrect ? 'Correct' : 'Incorrect'}</span>
                            </li>
                        ))}
                         {(!dbUser?.qotdAnswers || dbUser.qotdAnswers.length === 0) && (
                            <p className="text-muted-foreground text-center py-4">You haven't answered any questions yet.</p>
                        )}
                    </ul>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedOptionId || isSubmitting || hasAnswered
            }
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {hasAnswered
              ? "Answered"
              : isSubmitting
              ? "Submitting..."
              : "Submit Answer"}
          </Button>
        </CardFooter>
      </>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
        {authLoading ? (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : user ? (
            renderContent()
        ) : (
            <div className="text-center text-muted-foreground h-48 flex flex-col justify-center items-center">
                <ShieldCheck className="h-10 w-10 mb-2" />
                <p className="font-semibold">Question of the Day is available for users.</p>
                <p>Please log in or register to participate.</p>
            </div>
        )}
    </Card>
  );
}
