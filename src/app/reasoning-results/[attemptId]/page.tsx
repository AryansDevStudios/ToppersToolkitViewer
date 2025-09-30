
import { getReasoningQuizAttemptById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Trophy, Check, X, Circle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Image from 'next/image';


export const revalidate = 0;

export default async function ReasoningResultPage({ params }: { params: { attemptId: string } }) {
  const attempt = await getReasoningQuizAttemptById(params.attemptId);

  if (!attempt) {
    notFound();
  }

  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const timeZone = 'Asia/Kolkata';
  const completedDate = toZonedTime(new Date(attempt.createdAt), timeZone);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <header className="text-center mb-8">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Trophy className="h-12 w-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
          Reasoning Quiz Results
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's how <strong className="text-primary">{attempt.userName}</strong> performed on the quiz.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">{attempt.setName}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-6xl font-bold">
            {percentage}<span className="text-3xl text-muted-foreground">%</span>
          </p>
          <p className="text-2xl font-semibold">
            {attempt.score} / {attempt.totalQuestions}
          </p>
          <p className="text-sm text-muted-foreground">
            Completed on: {format(completedDate, 'PPP p', { timeZone })}
          </p>
        </CardContent>
         <CardFooter className="flex-col p-6">
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <span className="flex items-center gap-2 text-lg font-semibold">
                           <HelpCircle className="h-5 w-5 text-primary" />
                           Full Quiz Review
                        </span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-6 pt-4">
                            {attempt.answers && attempt.answers.map((answer, index) => {
                                const isCorrect = answer.selectedOptionIndex === answer.correctOptionIndex;
                                return (
                                    <div key={answer.mcqId} className="p-4 border rounded-lg bg-muted/30">
                                        <p className="font-semibold mb-2">{index + 1}. {answer.question}</p>
                                        {answer.imageUrl && (
                                            <div className="relative h-48 w-full my-4">
                                                <Image src={answer.imageUrl} alt="Question" layout="fill" objectFit="contain" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {answer.options.map((option, optIndex) => {
                                                const isSelected = optIndex === answer.selectedOptionIndex;
                                                const isActualCorrect = optIndex === answer.correctOptionIndex;
                                                
                                                return (
                                                     <div
                                                        key={optIndex}
                                                        className={cn("flex flex-col items-center justify-center gap-2 p-2 rounded-md border",
                                                            isSelected && !isCorrect && "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700",
                                                            isActualCorrect && "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700",
                                                        )}
                                                     >
                                                        {option.imageUrl && (
                                                            <div className="relative h-24 w-24">
                                                                <Image src={option.imageUrl} alt={`Option ${optIndex + 1}`} layout="fill" objectFit="contain" />
                                                            </div>
                                                        )}
                                                        {option.text && <span className="text-sm text-center">{option.text}</span>}
                                                        <div className="flex items-center gap-1 mt-auto pt-2">
                                                            {isSelected ? (
                                                                isCorrect ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />
                                                            ) : isActualCorrect ? (
                                                                <Check className="h-5 w-5 text-green-600" />
                                                            ) : (
                                                                <Circle className="h-5 w-5 text-muted-foreground/30" />
                                                            )}
                                                            <span className="text-xs text-muted-foreground">{isSelected ? "Your Pick" : isActualCorrect ? "Correct" : ""}</span>
                                                        </div>
                                                     </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="pt-8 w-full text-center">
                 <Button asChild>
                    <Link href="/reasoning">Try a Reasoning Quiz!</Link>
                 </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
