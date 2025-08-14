

"use client";

import Link from "next/link";
import { notFound, useParams, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Folder, ShieldAlert, Loader2 } from "lucide-react";
import { findItemBySlug, getUserById } from "@/lib/data";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PdfViewerWrapper } from "@/components/common/PdfViewerWrapper";
import type { Chapter, Note, SubSubject } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { iconMap } from "@/lib/iconMap";

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

const AccessDenied = () => (
    <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4 border rounded-lg bg-background">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
            You do not have permission to view this document. Please contact an administrator to request access.
        </p>
        <Button asChild className="mt-6">
            <Link href="/browse">Back to Browse</Link>
        </Button>
    </div>
);

const LoadingState = () => (
   <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4 border rounded-lg bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">Verifying Access...</h2>
        <p className="mt-2 text-muted-foreground">Please wait while we check your permissions.</p>
    </div>
)


export default function BrowsePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug : [params.slug];

  const [current, setCurrent] = useState<any>(null);
  const [parents, setParents] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null means loading
  const { user, role, loading: authLoading } = useAuth();
  
  const isNote = current && "pdfUrl" in current;
  const noteId = isNote ? slug[slug.length - 1] : null;

  useEffect(() => {
    async function fetchData() {
       const { current: currentItem, parents: parentItems } = await findItemBySlug(slug);
       if (!currentItem) {
          notFound();
       }
       setCurrent(currentItem);
       setParents(parentItems);
    }
    fetchData();
  }, [slug]);


  useEffect(() => {
    if (authLoading || !current) {
        // Wait for auth and data to be loaded
        return;
    }
    
    if (!isNote) {
        // If it's not a note page, access is always granted
        setHasAccess(true);
        return;
    }

    // Now, handle note access logic
    setHasAccess(null); // Set to loading state while we check

    async function checkAccess() {
        if (!user) {
            // No user logged in, so no access
            setHasAccess(false);
            return;
        }

        if (role === 'Admin') {
            // Admins have automatic access
            setHasAccess(true);
            return;
        }

        // For regular users, check their noteAccess field
        const userData = await getUserById(user.uid);
        if (userData?.noteAccess?.includes(noteId!)) {
            setHasAccess(true);
        } else {
            setHasAccess(false);
        }
    }

    checkAccess();

  }, [authLoading, user, role, current, isNote, noteId]);
  
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
      redirect('/login');
      return null;
  }

  if (!current) {
    return (
       <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  const breadcrumbItems = parents
    .slice(1)
    .map((p, i) => ({
      name: p.name,
      href: `/browse/${slug.slice(0, i + 1).join("/")}`,
    }))
    .concat(slug.length > (parents.length - 1) ? [{ name: current.name, href: `/browse/${slug.join('/')}` }] : []);

  const isSubject = "subSubjects" in current;
  const isSubSubject = !isNote && "chapters" in current;
  
  let children: any[] = [];
  if (isSubject) children = current.subSubjects;
  else if (isSubSubject) children = groupNotesByChapter(current.chapters);


  const renderContent = () => {
    if (isNote) {
        if (hasAccess === null) {
            return <LoadingState />;
        }
        if (hasAccess) {
            return (
                <div className="w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-background">
                    <PdfViewerWrapper url={current.pdfUrl} />
                </div>
            );
        }
        return <AccessDenied />;
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
        items={breadcrumbItems.slice(0,-1)}
        currentPageName={isNote ? current.type : current.name}
      />
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
           {isNote ? current.type : current.name}
        </h1>
         {isSubSubject && (
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
