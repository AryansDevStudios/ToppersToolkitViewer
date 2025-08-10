

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Folder, ShieldAlert } from "lucide-react";
import { findItemBySlug, getUserById } from "@/lib/data";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PdfViewerWrapper } from "@/components/common/PdfViewerWrapper";
import type { Chapter, Note, SubSubject, User } from "@/lib/types";
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';


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

const getCurrentUser = async (): Promise<User | null> => {
    console.log("--- [DEBUG] Attempting to get current user on server ---");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        console.log("[DEBUG] No session cookie found.");
        return null;
    }
     console.log("[DEBUG] Session cookie found.");

    if (!auth) {
        console.log("[DEBUG] Firebase Admin SDK is not initialized. Cannot verify session.");
        return null;
    }

    try {
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        console.log(`[DEBUG] Session cookie verified for UID: ${decodedToken.uid}`);
        const user = await getUserById(decodedToken.uid);
        if (user) {
            console.log(`[DEBUG] User data fetched from Firestore for user: ${user.name}`);
        } else {
            console.log(`[DEBUG] Could not fetch user data from Firestore for UID: ${decodedToken.uid}`);
        }
        return user;
    } catch (error) {
        console.error("[DEBUG] Error verifying session cookie or fetching user:", error);
        return null;
    }
};


export default async function BrowsePage({ params }: { params: { slug: string[] } }) {
  console.log("\n--- [DEBUG] NEW BROWSE PAGE REQUEST ---");
  const { slug } = params;
  console.log("[DEBUG] URL Slug:", slug);
  
  const { current, parents } = await findItemBySlug(slug);
  
  if (!current) {
    notFound();
  }

  const isNote = "pdfUrl" in current;
  console.log(`[DEBUG] Is this a note page? ${isNote}`);
  
  let hasAccess = false;
  
  if (isNote) {
    const user = await getCurrentUser();
    if (user) {
        console.log(`[DEBUG] User identified: ${user.name} (Role: ${user.role})`);
        if (user.role === 'Admin') {
            hasAccess = true;
            console.log("[DEBUG] User is Admin. Granting access.");
        } else {
            const noteId = slug[slug.length - 1];
            console.log(`[DEBUG] Checking access for Note ID: '${noteId}'`);
            console.log("[DEBUG] User's granted notes:", user.noteAccess || []);
            hasAccess = user.noteAccess?.includes(noteId) || false;
            console.log(`[DEBUG] Does user have access to this note? ${hasAccess}`);
        }
    } else {
        console.log("[DEBUG] No user is logged in.");
    }
  } else {
    // It's a subject or sub-subject list page, so access is always granted
    hasAccess = true;
    console.log("[DEBUG] This is a directory page, not a note. Access granted by default.");
  }
  
  console.log(`[DEBUG] Final access decision (hasAccess): ${hasAccess}`);
  console.log("--- [DEBUG] END OF PERMISSION CHECK ---");

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
    if (!hasAccess) {
        return <AccessDenied />;
    }

    if (isNote) {
        return (
            <div className="w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-background">
                <PdfViewerWrapper url={current.pdfUrl} />
            </div>
        );
    }
    
    if (isSubSubject) {
      // New Accordion View for Chapters and Notes
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
                      .map((note: any) => (
                      <Link
                        key={note.id}
                        href={`/browse/${slug.join("/")}/${note.id}`}
                        className="block"
                      >
                         <Card className="h-full transition-shadow duration-300 hover:shadow-lg hover:border-primary/50">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                               <div className="p-3 bg-primary/10 rounded-lg">
                                <FileText className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="font-semibold text-lg">{note.type}</CardTitle>
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
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {children.map((item) => (
          <Link key={item.id} href={`/browse/${slug.join("/")}/${item.id}`} className="block">
            <Card className="h-full transition-shadow duration-300 hover:shadow-lg hover:border-primary/50">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Folder className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-bold text-xl">{item.name}</CardTitle>
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

// Special case for the final leaf node (the note itself)
export async function generateMetadata({ params }: { params: { slug:string[] } }) {
  const { slug } = params;
  const { current, parents } = await findItemBySlug(slug);

  if (!current) {
    return {
      title: 'Not Found'
    }
  }
  
  const currentTitle = "pdfUrl" in current ? current.type : current.name;

  if (parents && parents.length > 1) {
    const parentName = parents[parents.length - 1]?.name;
    if (parentName) {
        return {
            title: `${currentTitle} | ${parentName}`
        };
    }
  }

  return {
    title: currentTitle
  }
}
