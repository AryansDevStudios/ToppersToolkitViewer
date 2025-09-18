
"use client";

import { useState } from 'react';
import type { Subject, MCQ } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { iconMap } from '@/lib/iconMap';
import { Folder, FileText, Library } from 'lucide-react';
import { MCQPlayer } from './MCQPlayer';

interface SubjectSelectorProps {
  subjects: Subject[];
}

interface SelectedChapter {
    mcqs: MCQ[];
    chapterName: string;
}

export function SubjectSelector({ subjects }: SubjectSelectorProps) {
  const [selectedChapter, setSelectedChapter] = useState<SelectedChapter | null>(null);

  const handleSelectChapter = (mcqs: MCQ[], chapterName: string) => {
    setSelectedChapter({ mcqs, chapterName });
  };
  
  const handleFinishQuiz = () => {
    setSelectedChapter(null);
  }

  if (selectedChapter) {
    return <MCQPlayer mcqs={selectedChapter.mcqs} chapterName={selectedChapter.chapterName} onFinish={handleFinishQuiz} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
        {subjects.map((subject) => {
            const SubjectIcon = iconMap[subject.icon] || Library;
            const hasMcqs = subject.subSubjects.some(ss => ss.chapters.some(c => c.mcqs && c.mcqs.length > 0));
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
                                const hasMcqsInSubSubject = subSubject.chapters.some(c => c.mcqs && c.mcqs.length > 0);
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
                                                    if (!chapter.mcqs || chapter.mcqs.length === 0) return null;
                                                    return (
                                                        <div key={chapter.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                                            <div className="flex items-center gap-3 font-medium">
                                                                <FileText className="h-5 w-5 text-primary/70" />
                                                                <span>{chapter.name} ({chapter.mcqs.length} Qs)</span>
                                                            </div>
                                                            <Button size="sm" onClick={() => handleSelectChapter(chapter.mcqs!, chapter.name)}>
                                                                Start Quiz
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
                    </CardContent>
                 </Card>
            )
        })}
    </div>
  );
}
