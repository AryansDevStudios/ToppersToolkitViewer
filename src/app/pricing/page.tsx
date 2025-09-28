
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
                    Get full access to all our premium study materials and tools by subscribing.
                </p>
            </div>
            <div className="mt-12 w-full max-w-md">
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
