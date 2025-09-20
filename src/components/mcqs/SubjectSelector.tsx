
"use client";

import { useState } from 'react';
import type { Subject, MCQ, MCQSet } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { iconMap } from '@/lib/iconMap';
import { Folder, FileText, Library, RefreshCcw } from 'lucide-react';
import { MCQPlayer } from './MCQPlayer';
import { useAuth } from '@/hooks/use-auth';

interface SubjectSelectorProps {
  subjects: Subject[];
}

interface SelectedChapter {
    mcqs: MCQ[];
    chapterId: string;
    chapterName: string;
}

export function SubjectSelector({ subjects }: SubjectSelectorProps) {
  const { dbUser } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState<SelectedChapter | null>(null);
  
  const attemptedQuizzes = dbUser?.attemptedQuizzes || [];

  const handleSelectChapter = (mcqs: MCQ[], chapterId: string, chapterName: string) => {
    setSelectedChapter({ mcqs, chapterId, chapterName });
  };
  
  const handleFinishQuiz = () => {
    setSelectedChapter(null);
  }

  if (selectedChapter) {
    return <MCQPlayer mcqs={selectedChapter.mcqs} chapterId={selectedChapter.chapterId} chapterName={selectedChapter.chapterName} onFinish={handleFinishQuiz} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
        {subjects.map((subject) => {
            const SubjectIcon = iconMap[subject.icon] || Library;
            const hasMcqs = subject.subSubjects.some(ss => ss.chapters.some(c => c.mcqSets && c.mcqSets.length > 0));
            if (!hasMcqs) return null;

            return (
                 <Card key={subject.id} className="mb-6">
                    <CardHeader className="flex flex-row items-center gap-4">
                         <SubjectIcon className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl">{subject.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {subject.subSubjects.map((subSubject) => {
                                const SubSubjectIcon = (subSubject.icon && iconMap[subSubject.icon]) || Folder;
                                const hasMcqsInSubSubject = subSubject.chapters.some(c => c.mcqSets && c.mcqSets.length > 0);
                                if (!hasMcqsInSubSubject) return null;

                                return (
                                    <AccordionItem value={subSubject.id} key={subSubject.id}>
                                        <AccordionTrigger className="text-lg">
                                             <div className="flex items-center gap-3">
                                                  <SubSubjectIcon className="h-5 w-5 text-primary/80" />
                                                  {subSubject.name}
                                             </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-8">
                                            <div className="space-y-2">
                                                {subSubject.chapters.map((chapter) => {
                                                    if (!chapter.mcqSets || chapter.mcqSets.length === 0) return null;

                                                    return chapter.mcqSets.map(mcqSet => {
                                                        const hasAttempted = attemptedQuizzes.includes(mcqSet.id);
                                                        return (
                                                            <div key={mcqSet.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                                                <div className="flex items-center gap-3 font-medium">
                                                                    <FileText className="h-5 w-5 text-primary/70" />
                                                                    <span>{chapter.name} - {mcqSet.name} ({mcqSet.mcqs.length} Qs)</span>
                                                                </div>
                                                                <Button size="sm" variant={hasAttempted ? 'outline' : 'default'} onClick={() => handleSelectChapter(mcqSet.mcqs, mcqSet.id, `${chapter.name} - ${mcqSet.name}`)}>
                                                                    {hasAttempted && <RefreshCcw className="mr-2 h-4 w-4" />}
                                                                    {hasAttempted ? 'Re-attempt Quiz' : 'Start Quiz'}
                                                                </Button>
                                                            </div>
                                                        )
                                                    })
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </CardContent>
                 </Card>
            )
        })}
    </div>
  );
}
