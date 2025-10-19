
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2, Maximize, Minimize, Printer, Star } from "lucide-react";
import { fetchNoteById } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, memo, useRef, useCallback } from "react";
import dynamic from 'next/dynamic';
import type { Note } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { DailyPreviewTimer } from "./DailyPreviewTimer";


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
        <h2 className="text-2xl font-bold text-destructive">
             Access Denied
        </h2>
        <p className="mt-2 text-muted-foreground max-w-md">
            You do not have permission to view this document. Please subscribe for full access.
        </p>
        <Button asChild className="mt-6">
            <Link href="/pricing">
                <Star className="mr-2 h-4 w-4"/>
                View Subscription Plans
            </Link>
        </Button>
    </div>
);

const LoadingState = () => (
   <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4 border rounded-lg bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">Loading Content...</h2>
        <p className="mt-2 text-muted-foreground">Please wait while we load your document.</p>
    </div>
)

interface NoteViewerProps {
    noteId: string;
    url?: string;
    renderAs?: 'pdf' | 'iframe';
}

const PREVIEW_KEY = 'notePreviewData';

const NoteViewerComponent = ({ noteId }: NoteViewerProps) => {
    const { user, dbUser, loading: authLoading } = useAuth(null);
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [note, setNote] = useState<Note | null>(null);
    const [isLoadingNote, setIsLoadingNote] = useState(true);

    // Daily preview state
    const [previewTimeLeft, setPreviewTimeLeft] = useState(60);
    const [isPreviewActive, setIsPreviewActive] = useState(false);

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
        if (authLoading || isLoadingNote || !note) return;
        if (!user) {
            router.push('/login');
            return;
        }
        if (!dbUser) return;
        
        const hasPermanentAccess = dbUser.hasFullNotesAccess === true || note.isPublic || (dbUser.noteAccess?.includes(noteId)) || dbUser.role === 'Admin';
        const isDemoActive = dbUser.demoExpiresAt ? dbUser.demoExpiresAt > Date.now() : false;

        if (hasPermanentAccess || isDemoActive) {
            setHasAccess(true);
            setIsPreviewActive(false);
        } else {
            // It's a non-subscribed user on a protected note, check daily preview
            const today = new Date().toISOString().split('T')[0];
            const storedData = localStorage.getItem(PREVIEW_KEY);
            let session = storedData ? JSON.parse(storedData) : { date: null, timeLeft: 60 };

            if (session.date !== today) {
                session = { date: today, timeLeft: 60 };
            }

            setPreviewTimeLeft(session.timeLeft);
            localStorage.setItem(PREVIEW_KEY, JSON.stringify(session));

            if (session.timeLeft > 0) {
                setHasAccess(true);
                setIsPreviewActive(true);
            } else {
                setHasAccess(false);
            }
        }
    }, [authLoading, user, dbUser, noteId, router, note, isLoadingNote]);
    
    // Countdown effect for the preview timer
    useEffect(() => {
        if (!isPreviewActive || previewTimeLeft <= 0) return;

        const timer = setInterval(() => {
            setPreviewTimeLeft(prevTime => {
                const newTime = prevTime - 1;
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem(PREVIEW_KEY, JSON.stringify({ date: today, timeLeft: newTime }));
                
                if (newTime <= 0) {
                    clearInterval(timer);
                    // Force a re-check of access which will now fail
                    setHasAccess(false);
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPreviewActive, previewTimeLeft]);
    
    const contentType = note?.renderAs || 'pdf';
    const contentUrl = note?.url || note?.pdfUrl || "";

    const renderContent = () => {
        if (hasAccess === null || isLoadingNote) return <LoadingState />;
        if (hasAccess === false) return <AccessDenied />;
        
        if (hasAccess && contentUrl) {
            switch(contentType) {
                case 'pdf':
                    return (
                        <div className="w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-background">
                            <PdfViewerWrapper url={contentUrl} />
                        </div>
                    );
                case 'iframe':
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
                default:
                    return <p>Unsupported content type.</p>
            }
        }
        
        return <AccessDenied />;
    };
    
    return (
        <div className="space-y-6">
            {isPreviewActive && <DailyPreviewTimer timeLeft={previewTimeLeft} />}
            {renderContent()}
             {(hasAccess && !dbUser?.hasFullNotesAccess) && (
                 <Card className="bg-primary/5 border-primary/20 shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                            <Star className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-primary">Need Full Access?</CardTitle>
                            <CardDescription>
                                Get unlimited access to all notes and features by subscribing.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/pricing">Upgrade to Full Access</Link>
                        </Button>
                    </CardContent>
                </Card>
             )}
            <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <Printer className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Need a Printed Copy?</CardTitle>
                        <CardDescription>
                            If you like our notes and would like a printed version, we can help.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href={`/order-print/${noteId}`}>Get it Printed</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export const NoteViewer = memo(NoteViewerComponent);
