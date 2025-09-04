

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";
import { getUserById, getNoteById as fetchNoteById } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, memo } from "react";
import dynamic from 'next/dynamic';
import type { Note } from "@/lib/types";

const PdfViewerWrapper = dynamic(() => import('@/components/common/PdfViewerWrapper').then(mod => mod.PdfViewerWrapper), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground w-full h-[calc(100vh-12rem)] bg-background">
            <Loader2 className="h-10 w-10 animate-spin mb-2" />
            <p>Loading Viewer...</p>
        </div>
    )
});


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

interface NoteViewerProps {
    noteId: string;
    pdfUrl: string;
}

const NoteViewerComponent = ({ noteId, pdfUrl }: NoteViewerProps) => {
    const { user, dbUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            router.push('/login');
            return;
        }
        
        // If dbUser is still loading, wait
        if (!dbUser) {
            return;
        }

        setHasAccess(null); // Set to loading state while we run async checks

        async function checkAccess() {
            // Check for admin role first
            if (dbUser.role === 'Admin') {
                setHasAccess(true);
                return;
            }

            // Fetch note data
            const noteData = await fetchNoteById(noteId);

            // Check if note is public
            if (noteData?.isPublic) {
                setHasAccess(true);
                return;
            }
            
            // Check if user has full access permission
            if (dbUser?.hasFullNotesAccess) {
                setHasAccess(true);
                return;
            }

            // Check if user has access to this specific note
            if (dbUser?.noteAccess?.includes(noteId)) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        }

        checkAccess();
    }, [authLoading, user, dbUser, noteId, router]);


    if (hasAccess === null) {
        return <LoadingState />;
    }

    if (hasAccess) {
        return (
            <div className="w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-background">
                <PdfViewerWrapper url={pdfUrl} />
            </div>
        );
    }
    
    return <AccessDenied />;
};

export const NoteViewer = memo(NoteViewerComponent);
