import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Folder } from "lucide-react";
import { findItemBySlug } from "@/lib/data";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PdfViewerWrapper } from "@/components/common/PdfViewerWrapper";
import type { Chapter, Note } from "@/lib/types";

// Helper to group notes by chapter name
const groupNotesByChapter = (chapters: Chapter[]) => {
  const grouped: { [key: string]: Chapter } = {};
  chapters.forEach((chapter) => {
    if (!grouped[chapter.name]) {
      grouped[chapter.name] = { ...chapter, notes: [] };
    }
    grouped[chapter.name].notes.push(...chapter.notes);
  });
  return Object.values(grouped);
};


export default async function BrowsePage({ params }: { params: { slug: string[] } }) {
  const { slug } = params;
  const { current, parents } = await findItemBySlug(slug);

  if (!current) {
    notFound();
  }

  const breadcrumbItems = parents
    .slice(1)
    .map((p, i) => ({
      name: p.name,
      href: `/browse/${slug.slice(0, i + 1).join("/")}`,
    }))
    .concat(slug.length > (parents.length - 1) ? [{ name: current.name, href: `/browse/${slug.join('/')}` }] : []);

  const isNote = "pdfUrl" in current;
  const isChapter = "notes" in current;
  const isSubSubject = "chapters" in current;
  const isSubject = "subSubjects" in current;

  let children: any[] = [];
  if (isSubject) children = current.subSubjects;
  else if (isSubSubject) children = groupNotesByChapter(current.chapters);
  else if (isChapter) children = current.notes;


  const renderContent = () => {
    if (isNote) {
      return (
        <div className="w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden">
             <PdfViewerWrapper url={current.pdfUrl} />
        </div>
      );
    }
    
    if (isSubSubject) {
      // New Accordion View for Chapters and Notes
      return (
        <Accordion type="multiple" className="w-full max-w-4xl mx-auto">
          {children.map((chapter) => (
            <AccordionItem value={chapter.id} key={chapter.id}>
              <AccordionTrigger className="text-xl font-headline hover:no-underline">
                {chapter.name}
              </AccordionTrigger>
              <AccordionContent className="pl-6">
                {chapter.notes && chapter.notes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                    {chapter.notes.map((note: any) => (
                      <Link
                        key={note.id}
                        href={`/browse/${slug.join("/")}/${note.id}`}
                        className="block"
                      >
                         <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                               <div className="p-3 bg-primary/10 rounded-lg">
                                <FileText className="w-8 h-8 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="font-headline text-lg">{note.type}</CardTitle>
                              </div>
                            </CardHeader>
                         </Card>
                      </Link>
                    ))}
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
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((item) => (
          <Link key={item.id} href={`/browse/${slug.join("/")}/${item.id}`} className="block">
            <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Folder className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    );
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={breadcrumbItems.slice(0,-1)}
        currentPageName={current.name || current.type}
      />
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold mb-2">
           {isNote ? current.type : current.name}
        </h1>
         {isSubSubject && (
          <p className="text-muted-foreground text-lg">
            Select a chapter to view its materials.
          </p>
        )}
      </header>

      {children.length > 0 ? renderContent() :
        <p className="text-muted-foreground italic text-center py-12">
            No materials available here yet.
        </p>
      }
    </div>
  );
}

// Special case for the final leaf node (the note itself)
export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const { slug } = params;
  const { current, parents } = await findItemBySlug(slug);

  if (!current) {
    return {
      title: 'Not Found'
    }
  }

  if ('pdfUrl' in current) {
    return {
      title: `${current.type} | ${parents[parents.length - 1]?.name || ''}`
    }
  }

  return {
    title: current.name
  }
}