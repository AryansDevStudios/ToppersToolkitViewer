
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getAllNotes, getSubjects } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrainCircuit, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { iconMap } from '@/lib/iconMap';
import type { Note, Subject } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type MindmapNote = Note & { subjectName: string; subSubjectName: string; subjectId: string; subSubjectId: string; chapter: string; slug: string; };

export default function MindmapPage() {
  const [loading, setLoading] = useState(true);
  const [mindmapNotes, setMindmapNotes] = useState<MindmapNote[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedSubSubject, setSelectedSubSubject] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [allNotes, allSubjects] = await Promise.all([getAllNotes(), getSubjects()]);
      
      const filteredMindmaps = allNotes
        .filter(note => note.type.toLowerCase().includes('mindmap'))
        .map(note => {
            const [subjectId, subSubjectId] = note.chapterId.split('/');
            return {...note, subjectId, subSubjectId };
        }) as MindmapNote[];

      setMindmapNotes(filteredMindmaps);
      setSubjects(allSubjects);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    const subjectIdsWithMindmaps = new Set(mindmapNotes.map(note => note.subjectId));
    return subjects.filter(subject => subjectIdsWithMindmaps.has(subject.id));
  }, [mindmapNotes, subjects]);

  const filteredSubSubjects = useMemo(() => {
    if (selectedSubject === 'all') return [];
    
    const subSubjectIdsWithMindmaps = new Set(
        mindmapNotes
            .filter(note => note.subjectId === selectedSubject)
            .map(note => note.subSubjectId)
    );

    const subject = subjects.find(s => s.id === selectedSubject);
    return subject ? subject.subSubjects.filter(ss => subSubjectIdsWithMindmaps.has(ss.id)) : [];
  }, [selectedSubject, mindmapNotes, subjects]);

  const displayedNotes = useMemo(() => {
    return mindmapNotes.filter(note => {
      const subjectMatch = selectedSubject === 'all' || note.subjectId === selectedSubject;
      const subSubjectMatch = selectedSubSubject === 'all' || note.subSubjectId === selectedSubSubject;
      return subjectMatch && subSubjectMatch;
    });
  }, [mindmapNotes, selectedSubject, selectedSubSubject]);

  const groupedByChapter = useMemo(() => {
    const grouped: { [key: string]: { chapterName: string, notes: MindmapNote[] } } = {};
    const notesToGroup = selectedSubSubject !== 'all' ? displayedNotes : [];

    notesToGroup.forEach(note => {
        if (!grouped[note.chapter]) {
            grouped[note.chapter] = { chapterName: note.chapter, notes: [] };
        }
        grouped[note.chapter].notes.push(note);
    });
    return Object.values(grouped);
  }, [displayedNotes, selectedSubSubject]);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedSubSubject('all');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <BrainCircuit className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Mind Maps
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Visualize complex topics. Select a subject to begin filtering.
        </p>
      </header>

      <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedSubject} onValueChange={handleSubjectChange} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {filteredSubjects.map(subject => (
              <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSubSubject} onValueChange={setSelectedSubSubject} disabled={selectedSubject === 'all' || loading}>
          <SelectTrigger>
            <SelectValue placeholder="Select Sub-Subject" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="all">All Sub-Subjects</SelectItem>
            {filteredSubSubjects.map(subSubject => (
              <SelectItem key={subSubject.id} value={subSubject.id}>{subSubject.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <main className="max-w-6xl mx-auto">
        {loading ? (
           <div className="flex justify-center items-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
           </div>
        ) : displayedNotes.length > 0 ? (
            selectedSubSubject !== 'all' ? (
                 <Accordion type="multiple" className="w-full space-y-4">
                     {groupedByChapter.map(({ chapterName, notes }) => (
                         <AccordionItem value={chapterName} key={chapterName} className="border rounded-lg bg-card">
                             <AccordionTrigger className="text-xl font-bold hover:no-underline px-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-primary" />
                                    {chapterName}
                                </div>
                             </AccordionTrigger>
                             <AccordionContent className="px-6 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                     {notes.map((note) => (
                                        <Link href={note.slug} key={note.id} className="block group">
                                            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                                                <CardContent className="p-4 flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-md">
                                                        <BrainCircuit className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                                        {note.type}
                                                    </CardTitle>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                             </AccordionContent>
                         </AccordionItem>
                     ))}
                 </Accordion>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedNotes.map((note) => {
                      const Icon = BrainCircuit;
                      return (
                        <Link href={note.slug} key={note.id} className="block group">
                          <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                  <Icon className="w-6 h-6 text-primary" />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="flex flex-col h-full pt-0">
                              <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {note.chapter}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mb-1">
                                {note.subSubjectName}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                 </div>
            )
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Mind Maps Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                It looks like no mind maps have been uploaded for the selected criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
