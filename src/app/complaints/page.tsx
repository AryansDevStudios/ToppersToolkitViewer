
"use client";

import { useState, useTransition, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, FileQuestion, Check, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createComplaint, getUserComplaints } from "@/lib/data";
import type { Complaint } from "@/lib/types";

const ComplaintCard = ({ complaint }: { complaint: Complaint }) => {
    return (
        <Card className="break-inside-avoid">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-base">{complaint.content}</p>
                    <Badge variant={complaint.status === 'resolved' ? 'default' : 'secondary'}>
                        {complaint.status}
                    </Badge>
                </div>
            </CardHeader>
            {complaint.status === 'resolved' && complaint.response && (
                <CardContent>
                     <div className="mt-2 bg-muted p-3 rounded-md border">
                        <p className="text-sm font-semibold text-primary">Reply from Admin:</p>
                        <p className="text-sm whitespace-pre-wrap">{complaint.response}</p>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

export default function ComplaintsPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [complaintText, setComplaintText] = useState("");
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, startTransition] = useTransition();

    useEffect(() => {
        if (authLoading) return; // Wait until auth state is resolved
        if (!user) {
            setIsLoading(false);
            return;
        }

        async function fetchComplaints() {
            setIsLoading(true);
            try {
                const userComplaints = await getUserComplaints(user!.uid);
                setComplaints(userComplaints);
            } catch (error) {
                toast({ title: "Error", description: "Could not fetch your past complaints.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        fetchComplaints();
    }, [user, authLoading, toast]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!complaintText.trim() || !user || !dbUser) return;

        startTransition(async () => {
            const result = await createComplaint(user.uid, dbUser.name, dbUser.classAndSection, complaintText);
            if (result.success) {
                toast({ title: "Complaint Submitted", description: "Your complaint has been sent to the admins." });
                setComplaintText("");
                // Refetch complaints to show the new one
                try {
                    const userComplaints = await getUserComplaints(user!.uid);
                    setComplaints(userComplaints);
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
        return <div className="p-8 text-center text-muted-foreground">Please log in to use the Complaint Box.</div>;
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-12">
                <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
                    <FileQuestion className="h-12 w-12" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                    Complaint Box
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Have an issue? Submit your complaint here for our admins to review.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form Section */}
                <div className="lg:order-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit a New Complaint</CardTitle>
                             <CardDescription>
                                Your issue will be sent to an admin for review. Please be as detailed as possible.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent>
                                <Textarea
                                    placeholder="Type your complaint here..."
                                    className="min-h-[150px] text-base"
                                    value={complaintText}
                                    onChange={(e) => setComplaintText(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={!complaintText.trim() || isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                                    ) : (
                                        <><Send className="mr-2 h-4 w-4" />Submit Complaint</>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                {/* History Section */}
                <div className="lg:order-1">
                    <h2 className="text-2xl font-bold mb-4">Your Past Complaints</h2>
                    <ScrollArea className="h-[60vh] w-full pr-4">
                         <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : complaints.length > 0 ? (
                                complaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} />)
                            ) : (
                                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <h3 className="text-lg font-semibold mb-1">You haven't submitted any complaints yet.</h3>
                                    <p>Use the form to submit your first complaint.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
