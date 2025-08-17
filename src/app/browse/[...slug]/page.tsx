

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Folder } from "lucide-react";
import { findItemBySlug, getNoteById, getSubjects } from "@/lib/data";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Chapter, Note, Subject } from "@/lib/types";
import { iconMap } from "@/lib/iconMap";
import { NoteViewer } from "@/components/common/NoteViewer";
import React from 'react';

export const revalidate = 0;

// Helper to group notes by chapter name, handling whitespace inconsistencies
const groupNotesByChapter = (chapters: Chapter[]) => {
    const grouped: { [key: string]: Note[] } = {};
    const chapterNameMap: { [key: string]: string } = {}; // To store the original name

    chapters.forEach(chapter => {
        const trimmedName = chapter.name.trim();
        if (!grouped[trimmedName]) {
            grouped[trimmedName] = [];
            chapterNameMap[trimmedName] = chapter.name; // Store the first occurrence of the name
        }
        if (chapter.notes) {
            grouped[trimmedName].push(...chapter.notes);
        }
    });
    return Object.entries(grouped).map(([trimmedName, notes]) => ({
        name: chapterNameMap[trimmedName], // Use the original, untrimmed name for display
        notes: notes
    }));
};

const getBreadcrumbItemsForNote = (subjects: Subject[], noteWithContext: any) => {
    const subject = subjects.find(s => s.id === noteWithContext.subjectId);
    if (!subject) return [];
    
    const subSubject = subject.subSubjects.find(ss => ss.id === noteWithContext.subSubjectId);
    if (!subSubject) return [];

    return [
        { name: subject.name, href: `/browse/${subject.id}` },
        { name: subSubject.name, href: `/browse/${subject.id}/${subSubject.id}` },
        { name: noteWithContext.chapterName, href: `/browse/${subject.id}/${subSubject.id}` }, // Chapter is not a direct link but part of the trail
    ];
}

export default async function BrowsePage({ params: paramsPromise }: { params: { slug: string[] } }) {
  const params = React.use(paramsPromise);
  const slug = params.slug || [];
  
  const { current, parents } = await findItemBySlug(slug);

  if (!current) {
    notFound();
  }
  
  const isNote = "pdfUrl" in current;
  let breadcrumbItems: {name: string, href: string}[] = [];
  let currentPageName: string = '';
  let noteChapterName: string = '';

  if (isNote) {
      const allSubjects = await getSubjects();
      const noteWithContext = await getNoteById(current.id);
      if (noteWithContext) {
          breadcrumbItems = getBreadcrumbItemsForNote(allSubjects, noteWithContext);
          noteChapterName = noteWithContext.chapterName;
      }
      currentPageName = current.type;
  } else {
     breadcrumbItems = parents
        .slice(1) // Remove the root "Browse"
        .map((p, i) => ({
          name: p.name,
          href: `/browse/${slug.slice(0, i + 1).join("/")}`,
        }))
        .concat(slug.length > (parents.length - 1) ? [{ name: current.name, href: `/browse/${slug.join('/')}` }] : []);
     
     if (breadcrumbItems.length > 0) {
        currentPageName = breadcrumbItems.pop()!.name;
     } else {
        currentPageName = current.name;
     }
  }
    
  const isSubject = "subSubjects" in current;
  const isSubSubject = !isNote && "chapters" in current;
  
  let children: any[] = [];
  if (isSubject) children = current.subSubjects;
  else if (isSubSubject) children = groupNotesByChapter(current.chapters);
  
  const pageTitle = isNote ? noteChapterName : currentPageName;

  const renderContent = () => {
    if (isNote) {
      // The client component handles access check and rendering
      return <NoteViewer noteId={current.id} pdfUrl={current.pdfUrl} />;
    }
    
    if (isSubSubject) {
      return (
        <Accordion type="multiple" className="w-full max-w-4xl mx-auto">
          {children.map((chapter) => (
            <AccordionItem value={chapter.name} key={chapter.name}>
              <AccordionTrigger className="text-xl font-bold hover:no-underline">
                {chapter.name}
              </AccordionTrigger>
              <AccordionContent className="pl-4 md:pl-6">
                {chapter.notes && chapter.notes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                    {chapter.notes
                      .sort((a: Note, b: Note) => (b.createdAt || 0) - (a.createdAt || 0))
                      .map((note: any) => {
                        const Icon = (note.icon && iconMap[note.icon]) || FileText;
                        return (
                          <Link
                            key={note.id}
                            href={`/browse/${slug.join("/")}/${note.id}`}
                            className="block"
                          >
                             <Card className="h-full transition-shadow duration-300 hover:shadow-lg hover:border-primary/50">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                                   <div className="p-3 bg-primary/10 rounded-lg">
                                    <Icon className="w-6 h-6 text-primary" />
                                  </div>
                                  <div>
                                    <CardTitle className="font-semibold text-lg">{note.type}</CardTitle>
                                  </div>
                                </CardHeader>
                             </Card>
                          </Link>
                        )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic py-4">
                    No materials available for this chapter yet.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );
    }

    // Default view for subjects -> sub-subjects
    return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {children.map((item) => {
          const Icon = (item.icon && iconMap[item.icon]) || Folder;
          return (
          <Link key={item.id} href={`/browse/${slug.join("/")}/${item.id}`} className="block">
            <Card className="h-full transition-shadow duration-300 hover:shadow-lg hover:border-primary/50">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-bold text-xl">{item.name}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </Link>
        )})}
      </div>
    );
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={breadcrumbItems}
        currentPageName={currentPageName}
      />
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
           {pageTitle}
        </h1>
         {isNote ? (
          <p className="text-muted-foreground text-lg">
            {current.type}
          </p>
         ) : isSubSubject && (
          <p className="text-muted-foreground text-lg">
            Select a chapter to view its materials.
          </p>
        )}
      </header>

      {children.length > 0 || isNote ? renderContent() :
        <p className="text-muted-foreground italic text-center py-12">
            No materials available here yet.
        </p>
      }
    </div>
  );
}
