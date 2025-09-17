
import { Suspense } from "react";
import { Puzzle } from 'lucide-react';
import { QuestionOfTheDaySection } from "@/components/home/QuestionOfTheDaySection";
import { getQuestionsOfTheDay } from "@/lib/data";
import { getUserById } from "@/lib/data";
import { cookies } from "next/headers";
import { getApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { format, parseISO } from "date-fns";
import { utcToZonedTime } from 'date-fns-tz';
import type { QuestionOfTheDay } from "@/lib/types";

async function getCurrentUser() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await getAdminAuth(getApp()).verifySessionCookie(sessionCookie, true);
    const user = await getUserById(decodedClaims.uid);
    return user;
  } catch (error) {
    return null;
  }
}

export const revalidate = 0;

const groupQuestionsByDate = (questions: QuestionOfTheDay[]) => {
    return questions.reduce((acc, question) => {
        // We need to parse the date as if it's UTC and then format it.
        const dateStr = format(parseISO(question.date), 'PPP');
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(question);
        return acc;
    }, {} as Record<string, QuestionOfTheDay[]>);
};


export default async function PuzzleAndQuizPage() {
  const allQuestions = await getQuestionsOfTheDay();
  const currentUser = await getCurrentUser();

  const timeZone = 'Asia/Kolkata';
  const now = new Date();
  const zonedNow = utcToZonedTime(now, timeZone);
  
  // By converting the question's UTC date string to a Date object,
  // it correctly represents the start of that day in UTC.
  // We can then compare it to the current zoned time.
  const pastAndPresentQuestions = allQuestions.filter(q => {
      // parseISO treats 'YYYY-MM-DD' as UTC midnight
      const questionDate = parseISO(q.date);
      return questionDate <= zonedNow;
  });

  const groupedQuestions = groupQuestionsByDate(pastAndPresentQuestions);
  const sortedDates = Object.keys(groupedQuestions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Puzzle className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Puzzles & Quizzes
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Challenge yourself with our daily questions!
        </p>
      </header>
      <main className="max-w-4xl mx-auto space-y-12">
        <Suspense fallback={
            <div className="h-64 w-full bg-muted rounded-lg animate-pulse" />
        }>
            {pastAndPresentQuestions.length > 0 ? (
                sortedDates.map(date => (
                    <section key={date} className="space-y-6">
                        <h2 className="text-2xl font-bold border-b pb-2">{date}</h2>
                        {groupedQuestions[date].map(question => (
                           <QuestionOfTheDaySection 
                                key={question.id}
                                initialQuestion={question}
                                initialUser={currentUser}
                            />
                        ))}
                    </section>
                ))
            ) : (
                 <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Puzzle className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Questions... Yet!</h2>
                    <p>The first daily question hasn't been posted. Check back soon!</p>
                </div>
            )}
        </Suspense>
      </main>
    </div>
  );
}
