
"use client";

import { useState, useEffect } from 'react';
import type { MCQ, QuizAttempt, AnswerRecord } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Check, X, ChevronsRight, RefreshCcw, Lightbulb, Share2 } from 'lucide-react';
import { markQuizAsAttempted, saveQuizAttempt } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface MCQPlayerProps {
  mcqs: MCQ[];
  chapterId: string; // This is now mcqSetId
  chapterName: string; // This is now mcqSetName
  onFinish: () => void;
}

export function MCQPlayer({ mcqs, chapterId: mcqSetId, chapterName: mcqSetName, onFinish }: MCQPlayerProps) {
  const { user, dbUser } = useAuth();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    // Check for Web Share API support on the client
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const currentQuestion = mcqs[currentQuestionIndex];
  
  const handleFinishQuiz = async () => {
    if (!user || !dbUser) return;
    setIsSaving(true);
    
    await markQuizAsAttempted(user.uid, mcqSetId);

    const finalAnswers = [...answers, {
        mcqId: currentQuestion.id,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctOptionIndex: currentQuestion.correctOptionIndex,
        selectedOptionIndex: selectedOption
    }];

    const result: Omit<QuizAttempt, 'id'> = {
        userId: user.uid,
        userName: dbUser.name,
        mcqSetId: mcqSetId,
        mcqSetName: mcqSetName,
        score: score + (selectedOption === currentQuestion.correctOptionIndex ? 1 : 0),
        totalQuestions: mcqs.length,
        answers: finalAnswers,
        createdAt: Date.now()
    };

    const { success, attemptId: newAttemptId, error } = await saveQuizAttempt(result);

    if (success && newAttemptId) {
        setAttemptId(newAttemptId);
    } else {
        toast({
            title: "Failed to Save Results",
            description: error || "Could not save your quiz attempt. Your results will not be shareable.",
            variant: "destructive"
        });
    }

    setIsSaving(false);
    setShowResults(true);
  }

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctOptionIndex) {
      setScore(score + 1);
    }
    
     setAnswers([...answers, {
        mcqId: currentQuestion.id,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctOptionIndex: currentQuestion.correctOptionIndex,
        selectedOptionIndex: selectedOption
    }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleFinishQuiz();
    }
  };

  const handleRestart = () => {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setShowResults(false);
      setAnswers([]);
      setAttemptId(null);
      setIsSaving(false);
  }

  const handleShare = async () => {
    if (!attemptId) {
        toast({ title: "Cannot Share", description: "Your results could not be saved, so a shareable link is not available.", variant: "destructive" });
        return;
    }
    
    const shareUrl = `${window.location.origin}/quiz-results/${attemptId}`;
    const shareText = `I scored ${score} out of ${mcqs.length} on the "${mcqSetName}" quiz on Topper's Toolkit! Can you beat my score? Check out my results!`;
    
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: 'Copied to Clipboard!',
          description: 'Quiz results link copied. You can now paste it to share.',
        });
      } catch (error) {
        toast({
          title: 'Failed to Copy',
          description: 'Could not copy results to clipboard.',
          variant: 'destructive',
        });
      }
    };

    if (isShareSupported) {
      try {
        await navigator.share({
          title: 'My Quiz Result!',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing, falling back to clipboard:', error);
        await copyToClipboard();
      }
    } else {
      await copyToClipboard();
    }
  };

  if (isSaving) {
    return (
        <Card className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-8 space-y-4 h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <CardTitle className="text-2xl">Saving Your Results...</CardTitle>
            <p className="text-muted-foreground">Please wait a moment.</p>
        </Card>
    );
  }

  if (showResults) {
     const incorrectCount = answers.filter(a => a.selectedOptionIndex !== a.correctOptionIndex).length;
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">You completed the quiz for <strong>{mcqSetName}</strong>.</p>
          <p className="text-4xl font-bold">
            You scored {score} out of {mcqs.length}
          </p>
           {incorrectCount > 0 && (
                <div className="text-left pt-4">
                    <Separator />
                    <h3 className="text-lg font-semibold my-4 flex items-center gap-2">
                        <Lightbulb className="text-amber-500"/>
                        Review Your Mistakes
                    </h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {answers.filter(a => a.selectedOptionIndex !== a.correctOptionIndex).map((answer, index) => (
                            <div key={index} className="p-3 border rounded-md bg-muted/30">
                                <p className="font-semibold mb-2">{answer.question}</p>
                                <div className="space-y-2 text-sm">
                                    <p className="flex items-center gap-2 bg-red-100 dark:bg-red-900/50 p-2 rounded">
                                        <X className="h-4 w-4 text-red-600 dark:text-red-400" /> 
                                        Your answer: {answer.options[answer.selectedOptionIndex!]}
                                    </p>
                                     <p className="flex items-center gap-2 bg-green-100 dark:bg-green-900/50 p-2 rounded">
                                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        Correct answer: {answer.options[answer.correctOptionIndex]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
           )}
          <div className="flex justify-center flex-wrap gap-4 pt-6">
             <Button onClick={handleRestart}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
            </Button>
            <Button variant="secondary" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
            </Button>
            <Button variant="outline" onClick={onFinish}>
              Choose Another Chapter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-primary">{mcqSetName}</h2>
            <p className="text-sm font-semibold">
                {currentQuestionIndex + 1} / {mcqs.length}
            </p>
        </div>
        <Progress value={((currentQuestionIndex + 1) / mcqs.length) * 100} />
        <CardTitle className="pt-4 text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = isAnswered && index === currentQuestion.correctOptionIndex;
          const isWrong = isAnswered && isSelected && !isCorrect;

          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full justify-start h-auto py-3 text-left whitespace-normal",
                !isAnswered && isSelected && "ring-2 ring-primary",
                isCorrect && "bg-green-100 border-green-300 text-green-900 hover:bg-green-200 dark:bg-green-900/50 dark:border-green-700 dark:text-green-100",
                isWrong && "bg-red-100 border-red-300 text-red-900 hover:bg-red-200 dark:bg-red-900/50 dark:border-red-700 dark:text-red-100"
              )}
              onClick={() => handleOptionSelect(index)}
              disabled={isAnswered}
            >
              <div className="flex items-center w-full">
                <span className="flex-1">{option}</span>
                {isCorrect && <Check className="h-5 w-5 ml-4" />}
                {isWrong && <X className="h-5 w-5 ml-4" />}
              </div>
            </Button>
          );
        })}
      </CardContent>
      <CardFooter className="justify-end">
        {isAnswered ? (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex === mcqs.length - 1 ? 'Show Results' : 'Next Question'}
            <ChevronsRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCheckAnswer} disabled={selectedOption === null}>
            Check Answer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
