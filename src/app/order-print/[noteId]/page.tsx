
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getNoteById, createPrintOrder } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Note } from '@/lib/types';

export default function OrderPrintPage() {
    const { noteId } = useParams();
    const router = useRouter();
    const { user, dbUser, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [note, setNote] = useState<(Note & { subjectName: string; chapterName: string; }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        if (!noteId) return;

        async function fetchNote() {
            setIsLoading(true);
            const noteData = await getNoteById(noteId as string);
            if (noteData) {
                setNote(noteData);
            } else {
                toast({ title: "Error", description: "Note not found.", variant: "destructive" });
                router.push('/browse');
            }
            setIsLoading(false);
        }
        fetchNote();
    }, [noteId, router, toast]);
    
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
            noteSubject: note.subjectName,
            instructions: instructions || undefined,
        });
        setIsSubmitting(false);

        if (result.success) {
            toast({ title: "Order Placed!", description: "Your print request has been sent to the admin." });
            router.push(`/browse/${note.subjectId}/${note.subSubjectId}/${note.id}`);
        } else {
            toast({ title: "Order Failed", description: result.error, variant: "destructive" });
        }
    };

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
                <Link href={`/browse/${note.subjectId}/${note.subSubjectId}/${note.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Note
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Place a Print Order</CardTitle>
                    <CardDescription>Review the details and add any special instructions below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary"/>
                            Note Details
                        </h3>
                        <p><strong>Note:</strong> {note.type}</p>
                        <p><strong>Chapter:</strong> {note.chapterName}</p>
                        <p><strong>Subject:</strong> {note.subjectName}</p>
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

