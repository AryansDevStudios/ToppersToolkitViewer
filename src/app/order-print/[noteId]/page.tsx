

"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getNoteById, createPrintOrder, getSettings } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, FileText, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Note, AppSettings } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker script path for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export default function OrderPrintPage() {
    const params = useParams();
    const noteId = params.noteId as string;
    const router = useRouter();
    const { user, dbUser, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [note, setNote] = useState<(Note & { subjectName: string; subSubjectName: string; chapterName: string; subjectId: string; subSubjectId: string; }) | null>(null);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [pageCount, setPageCount] = useState<number | null>(null);
    const [isCountingPages, setIsCountingPages] = useState(false);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        if (!noteId) return;

        async function fetchNoteAndSettings() {
            setIsLoading(true);
            try {
                const [noteData, settingsData] = await Promise.all([
                    getNoteById(noteId),
                    getSettings()
                ]);

                if (noteData) {
                    setNote(noteData);
                } else {
                    toast({ title: "Error", description: "Note not found.", variant: "destructive" });
                    router.push('/browse');
                }
                setSettings(settingsData);

            } catch (error) {
                toast({ title: "Error", description: "Failed to load page data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchNoteAndSettings();
    }, [noteId, router, toast]);

    useEffect(() => {
        if (note?.renderAs === 'pdf' && note.url) {
            const fetchPageCount = async () => {
                setIsCountingPages(true);
                try {
                    const loadingTask = pdfjsLib.getDocument(note.url!);
                    const pdf = await loadingTask.promise;
                    setPageCount(pdf.numPages);
                } catch (error) {
                    console.error("Failed to get PDF page count:", error);
                    setPageCount(null); // Explicitly set to null on error
                } finally {
                    setIsCountingPages(false);
                }
            };
            fetchPageCount();
        }
    }, [note]);

    const estimatedCost = useMemo(() => {
        if (!pageCount || !settings?.printCostPerPage) return null;
        // Cost is per sheet (2 pages), so we divide page count by 2 and take the ceiling.
        const sheets = Math.ceil(pageCount / 2);
        return sheets * settings.printCostPerPage;
    }, [pageCount, settings]);
    
    const handlePlaceOrder = async () => {
        if (!user || !dbUser || !note) {
            toast({ title: "Error", description: "You must be logged in to place an order.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const result = await createPrintOrder({
            userId: user.uid,
            userName: dbUser.name,
            userEmail: dbUser.email,
            noteId: note.id,
            noteType: note.type,
            noteChapter: note.chapterName,
            noteSubject: `${note.subSubjectName}, ${note.subjectName}`,
            instructions: instructions || undefined,
            price: estimatedCost ?? undefined,
        });
        
        if (result.success && result.orderId) {
            toast({ title: "Order Placed!", description: "Your print request has been sent to the admin." });
            router.push(`/order-confirmation/${result.orderId}`);
        } else {
            toast({ title: "Order Failed", description: result.error, variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    const renderCostInfo = () => {
        if (note?.renderAs !== 'pdf') {
             return (
                <div>
                    <p className="font-bold text-lg">&#8377;{settings?.printCostPerPage || 'N/A'} per page</p>
                    <p className="text-sm text-muted-foreground">(Could not count pages automatically. Final cost to be confirmed on WhatsApp)</p>
                </div>
            );
        }
        if (isCountingPages) {
            return (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating price...
                </div>
            );
        }
        if (estimatedCost !== null) {
            return (
                 <div className="flex items-baseline">
                    <p className="font-bold text-lg">{estimatedCost.toFixed(2)}</p>
                    <IndianRupee className="h-4 w-4 ml-1" />
                    <p className="text-sm text-muted-foreground ml-2">({pageCount} pages, printed back-to-back)</p>
                 </div>
            );
        }
        return (
            <div>
                <p className="font-bold text-lg">&#8377;{settings?.printCostPerPage || 'N/A'} per page</p>
                <p className="text-sm text-muted-foreground">(Could not count pages, final cost confirmed on WhatsApp)</p>
            </div>
        );
    }


    if (authLoading || isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!note) {
        return null; // or a dedicated "Not Found" component
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <Button asChild variant="outline" size="sm" className="mb-6">
                <Link href={`/browse/${note.subjectId}/${note.subSubjectId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chapter
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Place a Print Order</CardTitle>
                    <CardDescription>Review the details and add any special instructions below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-1">
                                <FileText className="h-5 w-5 text-primary"/>
                                Note Details
                            </h3>
                            <p><strong>Note:</strong> {note.type}</p>
                            <p><strong>Chapter:</strong> {note.chapterName}</p>
                            <p><strong>Subject:</strong> {note.subSubjectName}, {note.subjectName}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-1">
                                <IndianRupee className="h-5 w-5 text-primary"/>
                                Estimated Cost
                            </h3>
                            {renderCostInfo()}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="instructions" className="font-medium">
                            Special Instructions (Optional)
                        </label>
                        <Textarea
                            id="instructions"
                            placeholder="e.g., 'Please use spiral binding', 'Print pages back-to-back', etc."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="min-h-[120px]"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <Button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Placing Order...
                            </>
                        ) : (
                            'Confirm and Place Order'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
