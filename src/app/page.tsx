

import { Suspense } from "react";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { QuestionOfTheDaySection } from "@/components/home/QuestionOfTheDaySection";

export const revalidate = 0; 

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-10 md:py-12">
          <div className="container px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent inline-block">
              Topper's Toolkit
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mt-4 italic">
             "Study Smarter, Score Higher" <br /> -Kuldeep
            </p>
          </div>
        </section>

        <Suspense fallback={
            <div className="container">
                <div className="h-64 w-full bg-muted rounded-lg animate-pulse" />
            </div>
        }>
            <QuestionOfTheDaySection />
        </Suspense>

        <Suspense>
            <FeatureGrid />
        </Suspense>
      </main>
    </div>
  );
}
