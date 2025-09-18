

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2, Image as ImageIcon, FileText, Maximize, Minimize } from "lucide-react";
import { getUserById, getNoteById as fetchNoteById } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, memo, useRef, useCallback } from "react";
import dynamic from 'next/dynamic';
import type { Note } from "@/lib/types";
import Image from 'next/image';

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
    url?: string;
    renderAs?: 'pdf' | 'iframe';
}

const NoteViewerComponent = ({ noteId, url, renderAs }: NoteViewerProps) => {
    const { user, dbUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [note, setNote] = useState<Note | null>(null);
    const [isLoadingNote, setIsLoadingNote] = useState(true);

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", onFullscreenChange);

        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);


    useEffect(() => {
        async function loadNote() {
            setIsLoadingNote(true);
            const noteData = await fetchNoteById(noteId);
            setNote(noteData);
            setIsLoadingNote(false);
        }
        loadNote();
    }, [noteId]);

    useEffect(() => {
        if (authLoading || isLoadingNote || !note) {
            return;
        }

        if (!user) {
            router.push('/login');
            return;
        }
        
        if (!dbUser) {
            return;
        }
        
        setHasAccess(null); // Reset for re-check

        async function checkAccess() {
            if (dbUser.role === 'Admin' || note?.isPublic || dbUser.hasFullNotesAccess || dbUser.noteAccess?.includes(noteId)) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        }

        checkAccess();
    }, [authLoading, user, dbUser, noteId, router, note, isLoadingNote]);
    
    // Determine content type, defaulting to 'pdf' for backward compatibility
    const contentType = note?.renderAs || 'pdf';
    const contentUrl = note?.url || note?.pdfUrl || "";

    // For iframes, we can render optimistically while checking permissions.
    // For PDFs, we need to wait for the URL from the permission check.
    if (contentType === 'iframe' && contentUrl) {
         if (hasAccess === false) return <AccessDenied />;
         return (
            <div ref={containerRef} className="relative w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-background">
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 z-10 bg-background/50 hover:bg-background/80"
                    onClick={handleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
                <iframe
                    src={contentUrl}
                    className="w-full h-full border-0"
                    title="Embedded Content"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }
    
    // For other types, wait for access check to complete.
    if (hasAccess === null || isLoadingNote) {
        return <LoadingState />;
    }

    if (hasAccess === false) {
        return <AccessDenied />;
    }
    
    if (hasAccess && contentUrl) {
        switch(contentType) {
            case 'pdf':
                return (
                    <div className="w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-background">
                        <PdfViewerWrapper url={contentUrl} />
                    </div>
                );
            default:
                 return <p>Unsupported content type.</p>
        }
    }
    
    return <AccessDenied />;
};

export const NoteViewer = memo(NoteViewerComponent);