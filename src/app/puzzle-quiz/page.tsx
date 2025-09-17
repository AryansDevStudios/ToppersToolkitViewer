
import { Suspense } from "react";
import { Puzzle } from 'lucide-react';
import { QuestionOfTheDaySection } from "@/components/home/QuestionOfTheDaySection";

export default function PuzzleAndQuizPage() {
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
          Challenge yourself with our question of the day!
        </p>
      </header>
      <main>
        <Suspense fallback={
            <div className="h-64 w-full bg-muted rounded-lg animate-pulse" />
        }>
            <QuestionOfTheDaySection />
        </Suspense>
      </main>
    </div>
  );
}
