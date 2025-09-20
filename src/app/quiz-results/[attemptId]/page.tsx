
import { getQuizAttemptById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Check, X, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const revalidate = 0;

export default async function QuizResultPage({ params }: { params: { attemptId: string } }) {
  const attempt = await getQuizAttemptById(params.attemptId);

  if (!attempt) {
    notFound();
  }

  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <header className="text-center mb-8">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Trophy className="h-12 w-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
          Quiz Results
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's how <strong>{attempt.userName}</strong> performed on the quiz.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">{attempt.mcqSetName}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-6xl font-bold">
            {percentage}<span className="text-3xl text-muted-foreground">%</span>
          </p>
          <p className="text-2xl font-semibold">
            {attempt.score} / {attempt.totalQuestions}
          </p>
          <p className="text-sm text-muted-foreground">
            Completed on: {new Date(attempt.createdAt).toLocaleString()}
          </p>

           {attempt.incorrectAnswers.length > 0 && (
                <div className="text-left pt-6">
                    <Separator />
                    <h3 className="text-lg font-semibold my-4 flex items-center gap-2">
                        <Lightbulb className="text-amber-500"/>
                        Review of Incorrect Answers
                    </h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {attempt.incorrectAnswers.map((answer, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-muted/30 text-sm">
                                <p className="font-semibold mb-3">{answer.question}</p>
                                <div className="space-y-2">
                                    <p className="flex items-start gap-2 bg-red-100 dark:bg-red-900/50 p-2 rounded">
                                        <X className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" /> 
                                        <span>Your answer: {answer.selectedAnswer}</span>
                                    </p>
                                     <p className="flex items-start gap-2 bg-green-100 dark:bg-green-900/50 p-2 rounded">
                                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Correct answer: {answer.correctAnswer}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
           )}

            <div className="pt-8">
                 <Button asChild>
                    <Link href="/mcqs">Try a Quiz Yourself!</Link>
                 </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
