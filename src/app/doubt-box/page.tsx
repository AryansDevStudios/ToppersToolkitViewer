

"use client";

import { useState, useTransition, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageSquare, Check, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createDoubt, getUserDoubts } from "@/lib/data";
import type { Doubt } from "@/lib/types";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { Timestamp } from 'firebase/firestore';


const DoubtCard = ({ doubt }: { doubt: Doubt }) => {
    const timeZone = 'Asia/Kolkata';

    // Data is already a JS Date object from the server action.
    const zonedDate = toZonedTime(doubt.createdAt as Date, timeZone);
    let answeredAtDate = null;
    if (doubt.answeredAt) {
      answeredAtDate = toZonedTime(doubt.answeredAt as Date, timeZone);
    }

    return (
        <Card className="break-inside-avoid">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <p className="text-xs text-muted-foreground pt-1">
                        Asked on: {format(zonedDate, "PPP p")}
                    </p>
                    <Badge variant={doubt.status === 'answered' ? 'default' : 'secondary'}>
                        {doubt.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="font-semibold">{doubt.question}</p>
                {doubt.status === 'answered' && doubt.answer && (
                     <div className="mt-4 bg-muted p-3 rounded-md border">
                        <p className="text-sm font-semibold text-primary">Reply from Admin:</p>
                        <p className="text-sm whitespace-pre-wrap">{doubt.answer}</p>
                         {answeredAtDate && (
                             <p className="text-xs text-muted-foreground pt-2 mt-2 border-t">
                                Answered on {format(answeredAtDate, "PPP p")}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function DoubtBoxPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [question, setQuestion] = useState("");
    const [doubts, setDoubts] = useState<Doubt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, startTransition] = useTransition();

    useEffect(() => {
        if (authLoading) return; // Wait until auth state is resolved
        if (!user) {
            setIsLoading(false);
            return;
        }

        async function fetchDoubts() {
            setIsLoading(true);
            try {
                const userDoubts = await getUserDoubts(user!.uid);
                setDoubts(userDoubts);
            } catch (error) {
                toast({ title: "Error", description: "Could not fetch your past doubts.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchDoubts();
    }, [user, authLoading, toast]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !user || !dbUser) return;

        startTransition(async () => {
            const result = await createDoubt(user.uid, dbUser.name, dbUser.classAndSection, question);
            if (result.success) {
                toast({ title: "Doubt Submitted", description: "Your question has been sent to the admins." });
                setQuestion("");
                // Refetch doubts to show the new one
                try {
                    const userDoubts = await getUserDoubts(user!.uid);
                    setDoubts(userDoubts);
                } catch (error) {
                    // The main list will just be slightly delayed, not a critical error to show the user
                }
            } else {
                toast({ title: "Submission Failed", description: result.error, variant: "destructive" });
            }
        });
    };
    
    if (authLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!user) {
        return <div className="p-8 text-center text-muted-foreground">Please log in to use the Doubt Box.</div>;
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
                    Have a question? Drop it in the doubt box for our admins to answer.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form Section */}
                <div className="lg:order-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ask a New Question</CardTitle>
                             <CardDescription>
                                Your question will be sent to an admin for review.
                            </CardDescription>
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
                            <CardFooter>
                                <Button type="submit" disabled={!question.trim() || isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                                    ) : (
                                        <><Send className="mr-2 h-4 w-4" />Submit Doubt</>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                {/* History Section */}
                <div className="lg:order-1">
                    <h2 className="text-2xl font-bold mb-4">Your Past Questions</h2>
                    <ScrollArea className="h-[60vh] w-full pr-4">
                         <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : doubts.length > 0 ? (
                                doubts.map((doubt) => <DoubtCard key={doubt.id} doubt={doubt} />)
                            ) : (
                                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <h3 className="text-lg font-semibold mb-1">You haven't asked any questions yet.</h3>
                                    <p>Use the form to submit your first doubt.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
