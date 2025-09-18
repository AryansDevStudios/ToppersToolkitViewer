
"use client";

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageSquare, Loader2, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { createDoubt, getUserDoubts } from '@/lib/data';
import type { Doubt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DoubtBoxPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [question, setQuestion] = useState('');
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [isLoadingDoubts, setIsLoadingDoubts] = useState(true);
    const [isSubmitting, startSubmitting] = useTransition();
    const { toast } = useToast();
    const timeZone = 'Asia/Kolkata';

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        async function fetchDoubts() {
            setIsLoadingDoubts(true);
            try {
                const userDoubts = await getUserDoubts(user!.uid);
                setDoubts(userDoubts);
            } catch (error) {
                toast({ title: "Error", description: "Could not fetch your past doubts.", variant: "destructive" });
            } finally {
                setIsLoadingDoubts(false);
            }
        }

        fetchDoubts();
    }, [user, authLoading, router, toast]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!question.trim() || !user || !dbUser) return;

        startSubmitting(async () => {
            const result = await createDoubt(user.uid, dbUser.name, dbUser.classAndSection, question);
            if (result.success) {
                toast({ title: "Doubt Submitted!", description: "Your question has been sent to the admins." });
                setQuestion('');
                // Refetch doubts to show the new one
                const userDoubts = await getUserDoubts(user.uid);
                setDoubts(userDoubts);
            } else {
                toast({ title: "Submission Failed", description: result.error, variant: "destructive" });
            }
        });
    };

    if (authLoading || (!user && !authLoading)) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-12">
                <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
                    <MessageSquare className="h-12 w-12" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                    Doubt Box
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Have a question? Ask our team directly and we'll get back to you.
                </p>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Form Section */}
                <div className="lg:order-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ask a New Question</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent>
                                <Textarea
                                    placeholder="Type your question here..."
                                    className="min-h-[150px] text-base"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting || !question.trim()}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Doubt
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                {/* History Section */}
                <div className="lg:order-1">
                     <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Your Past Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[50vh]">
                             {isLoadingDoubts ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                             ) : (
                                <ScrollArea className="h-full pr-4">
                                    {doubts.length > 0 ? (
                                        <div className="space-y-6">
                                            {doubts.map(doubt => {
                                                 // Correctly handle Firestore Timestamps
                                                const createdAtDate = (doubt.createdAt as any)?.toDate ? (doubt.createdAt as any).toDate() : new Date(doubt.createdAt);
                                                const answeredAtDate = (doubt.answeredAt as any)?.toDate ? (doubt.answeredAt as any).toDate() : (doubt.answeredAt ? new Date(doubt.answeredAt) : null);

                                                const zonedDate = toZonedTime(createdAtDate, timeZone);
                                                 
                                                 return (
                                                    <div key={doubt.id} className="border-l-4 pl-4 py-2" style={{borderColor: doubt.status === 'answered' ? 'hsl(var(--primary))' : 'hsl(var(--border))'}}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="text-sm text-muted-foreground">{format(zonedDate, "PPP p")}</p>
                                                            <Badge variant={doubt.status === 'answered' ? 'default' : 'secondary'}>
                                                                {doubt.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="font-semibold text-card-foreground mb-3">{doubt.question}</p>
                                                        
                                                        {doubt.status === 'answered' && doubt.answer && (
                                                            <div className="bg-muted p-3 rounded-md mt-2">
                                                                <p className="text-sm font-semibold text-primary">Admin's Reply:</p>
                                                                <p className="text-sm text-foreground whitespace-pre-wrap">{doubt.answer}</p>
                                                                 {answeredAtDate && (
                                                                    <p className="text-xs text-muted-foreground pt-2 mt-2 border-t">
                                                                        Answered by {doubt.answeredBy} on {format(toZonedTime(answeredAtDate, timeZone), "PPP p")}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                 )
                                            })}
                                        </div>
                                    ) : (
                                         <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                            <MessageSquare className="h-12 w-12 mb-4" />
                                            <p className="font-semibold">You haven't asked any questions yet.</p>
                                            <p className="text-sm">Use the form to submit your first doubt.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

    