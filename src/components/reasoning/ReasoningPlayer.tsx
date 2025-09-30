
"use client";

import { useState, useEffect } from 'react';
import type { ReasoningMCQ, ReasoningQuizAttempt, ReasoningAnswerRecord } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Check, X, ChevronsRight, RefreshCcw, Lightbulb, Share2, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { saveReasoningQuizAttempt, markReasoningAsAttempted } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

interface ReasoningPlayerProps {
  mcqs: ReasoningMCQ[];
  setId: string;
  setName: string;
  onFinish: () => void;
}

export function ReasoningPlayer({ mcqs, setId, setName, onFinish }: ReasoningPlayerProps) {
  const { user, dbUser } = useAuth();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<(Omit<ReasoningAnswerRecord, 'mcqId'> & {mcqId?: string})[]>([]);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  
  const currentQuestion = mcqs[currentQuestionIndex];
  
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleFinishQuiz = async () => {
    if (!user || !dbUser) return;
    setIsSaving(true);
    
    await markReasoningAsAttempted(user.uid, setId);

    const allAnswers: ReasoningAnswerRecord[] = mcqs.map((mcq, index) => {
      const answered = answers[index];
      return {
          mcqId: mcq.id,
          question: mcq.question,
          imageUrl: mcq.imageUrl,
          options: mcq.options,
          correctOptionIndex: mcq.correctOptionIndex,
          selectedOptionIndex: answered ? answered.selectedOptionIndex : null
      }
    });

    const finalScore = allAnswers.reduce((acc, ans) => {
        return ans.selectedOptionIndex === ans.correctOptionIndex ? acc + 1 : acc;
    }, 0);

    const result: Omit<ReasoningQuizAttempt, 'id' | 'createdAt'> = {
        userId: user.uid,
        userName: dbUser.name,
        setId: setId,
        setName: setName,
        score: finalScore,
        totalQuestions: mcqs.length,
        answers: allAnswers,
    };

    const { success, attemptId: newAttemptId, error } = await saveReasoningQuizAttempt(result);
    if (success && newAttemptId) {
        setAttemptId(newAttemptId);
    } else {
        toast({ title: "Failed to Save Results", description: error, variant: "destructive" });
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
    
    setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex] = {
            question: currentQuestion.question,
            imageUrl: currentQuestion.imageUrl,
            options: currentQuestion.options,
            correctOptionIndex: currentQuestion.correctOptionIndex,
            selectedOptionIndex: selectedOption
        };
        return newAnswers;
    });

    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctOptionIndex) {
      setScore(score + 1);
    }
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
    
    const finalScore = answers.reduce((acc, ans, index) => {
        return ans.selectedOptionIndex === mcqs[index].correctOptionIndex ? acc + 1 : acc;
    }, 0);
    
    const shareUrl = `${window.location.origin}/reasoning-results/${attemptId}`;
    const shareText = `I scored ${finalScore} out of ${mcqs.length} on the "${setName}" quiz on Topper's Toolkit! Can you beat my score? Check out my results!`;
    
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({ title: 'Copied to Clipboard!', description: 'Quiz results link copied. You can now paste it to share.' });
      } catch (error) {
        toast({ title: 'Failed to Copy', description: 'Could not copy results to clipboard.', variant: 'destructive' });
      }
    };

    if (isShareSupported) {
      try {
        await navigator.share({ title: 'My Quiz Result!', text: shareText, url: shareUrl });
      } catch (error) {
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
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">You completed the quiz for <strong>{setName}</strong>.</p>
          <p className="text-4xl font-bold">
            You scored {score} out of {mcqs.length}
          </p>
          <div className="flex justify-center flex-wrap gap-4 pt-4">
             <Button onClick={handleRestart}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
            </Button>
            <Button variant="secondary" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
            </Button>
            <Button variant="outline" onClick={onFinish}>
              Choose Another Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
             <Button variant="outline" size="sm" onClick={onFinish} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Quizzes
            </Button>
            <h2 className="text-sm font-medium text-primary">{setName}</h2>
            <p className="text-sm font-semibold">
                {currentQuestionIndex + 1} / {mcqs.length}
            </p>
        </div>
        <Progress value={((currentQuestionIndex + 1) / mcqs.length) * 100} />
        {currentQuestion.question && <CardTitle className="pt-4 text-xl">{currentQuestion.question}</CardTitle>}
        {currentQuestion.imageUrl && (
            <div className="mt-4 relative h-64 w-full">
                <Image src={currentQuestion.imageUrl} alt="Question visual" layout="fill" objectFit="contain" />
            </div>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = isAnswered && index === currentQuestion.correctOptionIndex;
          const isWrong = isAnswered && isSelected && !isCorrect;

          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "h-auto p-4 flex flex-col gap-4 items-center justify-center",
                !isAnswered && isSelected && "ring-2 ring-primary",
                isCorrect && "bg-green-100 border-green-300 text-green-900 hover:bg-green-200 dark:bg-green-900/50 dark:border-green-700 dark:text-green-100",
                isWrong && "bg-red-100 border-red-300 text-red-900 hover:bg-red-200 dark:bg-red-900/50 dark:border-red-700 dark:text-red-100"
              )}
              onClick={() => handleOptionSelect(index)}
              disabled={isAnswered}
            >
              {option.imageUrl && (
                <div className="relative h-32 w-full">
                    <Image src={option.imageUrl} alt={`Option ${index+1}`} layout="fill" objectFit="contain" />
                </div>
              )}
              {option.text && <span className="text-center">{option.text}</span>}
              {isCorrect && <Check className="h-5 w-5 absolute top-2 right-2" />}
              {isWrong && <X className="h-5 w-5 absolute top-2 right-2" />}
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
