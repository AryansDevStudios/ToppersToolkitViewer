

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
    'Full Access to All Notes',
    'Unlimited AI Doubt Solver',
    'All MCQ & Quiz Practice Sets',
    'Compete on the Leaderboard',
    'Access All Mind Maps',
    'YouTube Learning Guides',
    'Priority Doubt Resolution',
    'Submit Complaints',
    'View Full Notice Board',
    'Personalized Order History'
];

export default function PricingPage() {
    const { user, dbUser, loading: authLoading } = useAuth(null);
    const [isStartingDemo, setIsStartingDemo] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        // If a logged-in user with full access lands here, redirect them to the homepage.
        // Guests or users without full access should be able to see this page.
        if (!authLoading && user && dbUser?.hasFullNotesAccess) {
             router.replace('/');
        }
    }, [authLoading, user, dbUser, router]);
    
    useEffect(() => {
        if (dbUser?.demoExpiresAt) {
            const expiry = dbUser.demoExpiresAt;
            
            const updateTimer = () => {
                const currentNow = Date.now();
                const diff = expiry - currentNow;

                if (diff <= 0) {
                    setTimeLeft("Expired");
                    // No need for interval if it's already expired
                    return;
                }

                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            };

            updateTimer(); // Initial call
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [dbUser]);


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
    
    const isDemoActive = dbUser?.demoExpiresAt ? dbUser.demoExpiresAt > Date.now() : false;
    const hasUsedDemo = !!dbUser?.demoExpiresAt;


    if (authLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
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
                         {isDemoActive && timeLeft ? (
                             <Button className="w-full" variant="destructive" disabled>
                                <Clock className="mr-2 h-4 w-4" />
                                Demo active: {timeLeft} remaining
                             </Button>
                         ) : (
                            <Button className="w-full" variant="outline" onClick={handleStartDemo} disabled={isStartingDemo || hasUsedDemo}>
                                {isStartingDemo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {hasUsedDemo ? 'Demo Period Finished' : 'Start 1-Hour Demo'}
                            </Button>
                         )}
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
