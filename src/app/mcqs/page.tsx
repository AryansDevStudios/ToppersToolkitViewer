
import { getSubjects } from '@/lib/data';
import { BookCheck } from 'lucide-react';
import type { Subject, MCQ } from '@/lib/types';
import { SubjectSelector } from '@/components/mcqs/SubjectSelector';

export const revalidate = 0;

export default async function MCQsPage() {
  const subjects = await getSubjects();

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <BookCheck className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          MCQs Practice
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Select a subject and chapter to test your knowledge.
        </p>
      </header>
      <main>
        <SubjectSelector subjects={subjects} />
      </main>
    </div>
  );
}
