
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { startUserDemo } from '@/lib/data';

const includedFeatures = [
    'Full Access to All Notes',
    'Unlimited AI Doubt Solver',
    'All MCQ & Quiz Practice Sets',
    'Compete on the Leaderboard',
    'Access All Mind Maps',
    'YouTube Learning Guides',
    'Priority Doubt Resolution',
    'Submit Complaints',
    'View Full Notice Board',
    'Personalized Order History',
    'Reasoning Practice Section',
    'GK & Current Affairs for GS Olympiad',
];

export default function PricingPage() {
    const { user, dbUser, loading: authLoading } = useAuth(null);
    const router = useRouter();
    const { toast } = useToast();
    const [isStartingDemo, setIsStartingDemo] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        if (!dbUser?.demoExpiresAt) {
            setTimeLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const expiration = dbUser.demoExpiresAt!;
            const remaining = expiration - now;

            if (remaining <= 0) {
                setTimeLeft("Expired");
                clearInterval(interval);
                router.refresh(); 
            } else {
                const minutes = Math.floor((remaining / 1000) / 60);
                const seconds = Math.floor((remaining / 1000) % 60);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [dbUser, router]);


    const handleStartDemo = async () => {
        if (!user) {
            toast({ title: "Please log in", description: "You need to be logged in to start a demo.", variant: "destructive" });
            return;
        }
        setIsStartingDemo(true);
        const result = await startUserDemo(user.uid);
        if (result.success) {
            toast({ title: "Demo Started!", description: "You have 1 hour of full access. Enjoy!" });
            router.push('/');
        } else {
            toast({ title: "Error", description: result.error || "Could not start the demo.", variant: "destructive" });
            setIsStartingDemo(false);
        }
    };
    
    if (authLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    // Determine user eligibility for different states
    const isDemoEligible = dbUser && !dbUser.hasFullNotesAccess && !dbUser.demoExpiresAt;
    const isDemoActive = dbUser && !dbUser.hasFullNotesAccess && dbUser.demoExpiresAt && timeLeft && timeLeft !== "Expired";


    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                    Unlock Your Potential
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Get full access to all our premium study materials and tools by subscribing, or start a free demo.
                </p>
            </div>
            <div className="mt-12 w-full max-w-md">

                {isDemoActive && (
                    <>
                        <Card className="mb-8 border-dashed border-primary">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Clock className="h-6 w-6"/>
                                    Demo Active
                                </CardTitle>
                                <CardDescription>
                                   Your full access trial is currently running.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-muted-foreground">Time Remaining:</p>
                                <p className="text-4xl font-bold">{timeLeft}</p>
                            </CardContent>
                        </Card>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                OR
                                </span>
                            </div>
                        </div>
                    </>
                )}


                {isDemoEligible && (
                    <>
                        <Card className="mb-8 border-dashed">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-6 w-6 text-primary"/>
                                    Try for Free
                                </CardTitle>
                                <CardDescription>
                                   Get a glimpse of all features with a one-time demo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-bold">1-Hour Full Access Demo</p>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleStartDemo} disabled={isStartingDemo} variant="outline" className="w-full">
                                    {isStartingDemo ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                                    ) : (
                                        "Start 1-Hour Demo"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                        
                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                OR
                                </span>
                            </div>
                        </div>
                    </>
                )}


                {/* Subscription Card */}
                <Card className="flex flex-col ring-2 ring-primary">
                     <CardHeader>
                        <CardTitle className="text-2xl">Full Subscription</CardTitle>
                        <CardDescription>
                           The best value for dedicated learners.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="flex items-baseline gap-2">
                           <span className="text-2xl font-bold text-muted-foreground line-through">₹999</span>
                           <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">₹100</span>
                           <span className="text-xl font-normal text-muted-foreground">/month</span>
                        </div>
                        <ul className="space-y-3 text-sm">
                            {includedFeatures.map((feature) => (
                                <li key={feature} className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                            <Link href="/subscribe">
                                <Star className="mr-2 h-4 w-4" />
                                Choose Plan
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

