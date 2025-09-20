

"use client";

import { useState, useEffect } from 'react';
import type { MCQ } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Check, X, ChevronsRight, RefreshCcw } from 'lucide-react';
import { markQuizAsAttempted } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';

interface MCQPlayerProps {
  mcqs: MCQ[];
  chapterId: string;
  chapterName: string;
  onFinish: () => void;
}

export function MCQPlayer({ mcqs, chapterId, chapterName, onFinish }: MCQPlayerProps) {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = mcqs[currentQuestionIndex];
  
  useEffect(() => {
    if (showResults && user) {
        markQuizAsAttempted(user.uid, chapterId);
    }
  }, [showResults, user, chapterId]);

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
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setShowResults(false);
  }

  if (showResults) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">You completed the quiz for <strong>{chapterName}</strong>.</p>
          <p className="text-4xl font-bold">
            You scored {score} out of {mcqs.length}
          </p>
          <div className="flex justify-center gap-4 pt-4">
             <Button onClick={handleRestart}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
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
            <h2 className="text-sm font-medium text-primary">{chapterName}</h2>
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
