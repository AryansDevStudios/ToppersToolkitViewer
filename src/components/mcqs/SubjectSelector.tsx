
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
    chapterId: string; // This is actually mcqSetId
    chapterName: string; // This is actually mcqSetName
}

export function SubjectSelector({ subjects }: SubjectSelectorProps) {
  const { dbUser } = useAuth();
  const [selectedMCQSet, setSelectedMCQSet] = useState<SelectedChapter | null>(null);
  
  const attemptedQuizzes = dbUser?.attemptedQuizzes || [];

  const handleSelectMCQSet = (mcqs: MCQ[], mcqSetId: string, mcqSetName: string) => {
    setSelectedMCQSet({ mcqs, chapterId: mcqSetId, chapterName: mcqSetName });
  };
  
  const handleFinishQuiz = () => {
    setSelectedMCQSet(null);
  }

  if (selectedMCQSet) {
    return <MCQPlayer mcqs={selectedMCQSet.mcqs} chapterId={selectedMCQSet.chapterId} chapterName={selectedMCQSet.chapterName} onFinish={handleFinishQuiz} />;
  }
  
  const subjectsWithMcqs = subjects.filter(subject => 
    subject.subSubjects.some(ss => 
      ss.chapters.some(c => c.mcqSets && c.mcqSets.length > 0)
    )
  );

  return (
    <div className="max-w-4xl mx-auto">
        {subjectsWithMcqs.length > 0 ? (
          subjectsWithMcqs.map((subject) => {
            const SubjectIcon = iconMap[subject.icon] || Library;

            return (
                 <Card key={subject.id} className="mb-6 shadow-md">
                    <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 rounded-t-lg">
                         <SubjectIcon className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl">{subject.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                            {subject.subSubjects.map((subSubject) => {
                                const SubSubjectIcon = (subSubject.icon && iconMap[subSubject.icon]) || Folder;
                                const hasMcqsInSubSubject = subSubject.chapters.some(c => c.mcqSets && c.mcqSets.length > 0);
                                if (!hasMcqsInSubSubject) return null;

                                return (
                                    <AccordionItem value={subSubject.id} key={subSubject.id} className="border-x-0 border-t-0 last:border-b-0 px-6 data-[state=open]:bg-accent/20">
                                        <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                                             <div className="flex items-center gap-3">
                                                  <SubSubjectIcon className="h-5 w-5 text-primary/80" />
                                                  {subSubject.name}
                                             </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-6 pb-6">
                                            <Accordion type="single" collapsible className="w-full space-y-2">
                                                 {subSubject.chapters.map((chapter) => {
                                                    if (!chapter.mcqSets || chapter.mcqSets.length === 0) return null;

                                                    return (
                                                        <AccordionItem value={chapter.id} key={chapter.id} className="border-b-0">
                                                            <AccordionTrigger className="text-md font-semibold hover:no-underline bg-muted/50 px-4 rounded-md">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className="h-5 w-5" />
                                                                    {chapter.name}
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pl-6 pt-4">
                                                                <div className="space-y-3">
                                                                     {chapter.mcqSets.map(mcqSet => {
                                                                        const hasAttempted = attemptedQuizzes.includes(mcqSet.id);
                                                                        return (
                                                                            <div key={mcqSet.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                                                                                <p className="font-semibold">{mcqSet.name} <span className="text-muted-foreground text-sm font-normal">({mcqSet.mcqs.length} Qs)</span></p>
                                                                                <Button size="sm" variant={hasAttempted ? 'outline' : 'default'} onClick={() => handleSelectMCQSet(mcqSet.mcqs, mcqSet.id, `${chapter.name} - ${mcqSet.name}`)}>
                                                                                    {hasAttempted && <RefreshCcw className="mr-2 h-4 w-4" />}
                                                                                    {hasAttempted ? 'Re-attempt Quiz' : 'Start Quiz'}
                                                                                </Button>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    )
                                                 })}
                                            </Accordion>
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </CardContent>
                 </Card>
            )
        })
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>No Quizzes Available</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-12">
                    It looks like no MCQs have been added yet. Please check back later.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
