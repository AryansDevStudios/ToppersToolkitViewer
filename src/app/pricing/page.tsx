
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { startDemo } from '@/lib/data';
import { Loader2 } from 'lucide-react';

const includedFeatures = [
    'Access to All Notes',
    'AI Doubt Solver',
    'MCQ Practice Sets',
    'Ad-Free Experience',
];

export default function PricingPage() {
    const { user, dbUser, loading: authLoading } = useAuth(null);
    const [isStartingDemo, setIsStartingDemo] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        // If user already has a subscription or an active demo, redirect them
        if (!authLoading && (dbUser?.hasFullNotesAccess || (dbUser?.demoExpiresAt && dbUser.demoExpiresAt > Date.now()))) {
            router.replace('/');
        }
    }, [authLoading, dbUser, router]);


    const handleStartDemo = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        
        setIsStartingDemo(true);
        const result = await startDemo(user.uid);
        
        if (result.success) {
            toast({
                title: "Demo Started!",
                description: "You now have 1 hour of full access.",
            });
            router.push('/');
        } else {
            toast({
                title: "Error",
                description: result.error || "Could not start the demo.",
                variant: "destructive",
            });
            setIsStartingDemo(false);
        }
    };

    if (authLoading || (dbUser?.hasFullNotesAccess || (dbUser?.demoExpiresAt && dbUser.demoExpiresAt > Date.now()))) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Unlock Your Potential
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Choose the plan that's right for you. Get full access to all our premium study materials and tools.
                </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                
                {/* Free Demo Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl">Free Demo</CardTitle>
                        <CardDescription>
                            Explore all features of Topper's Toolkit for a limited time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                         <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="font-semibold">1-Hour Full Access</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Get a taste of what our platform offers. After one hour, you'll need to subscribe to continue accessing notes.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" onClick={handleStartDemo} disabled={isStartingDemo}>
                            {isStartingDemo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Start 1-Hour Demo
                        </Button>
                    </CardFooter>
                </Card>

                {/* Subscription Card */}
                <Card className="flex flex-col ring-2 ring-primary">
                     <CardHeader>
                        <CardTitle className="text-2xl">Full Subscription</CardTitle>
                        <CardDescription>
                           The best value for dedicated learners.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="text-4xl font-bold">
                            ₹100 <span className="text-xl font-normal text-muted-foreground">/month</span>
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
                        <Button asChild className="w-full">
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
