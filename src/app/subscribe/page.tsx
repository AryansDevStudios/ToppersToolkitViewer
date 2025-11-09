
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Star, Copy, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createSubscriptionRequest } from '@/lib/data';

const includedFeatures = [
    'Access to Premium Notes',
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

const UPI_ID = "nitish545454@ybl";

export default function SubscribePage() {
    const { toast } = useToast();
    const { user, dbUser } = useAuth(null);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCopyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: `${type} Copied!`,
                description: `${text} has been copied to your clipboard.`,
            });
        }).catch(() => {
            toast({
                title: "Copy Failed",
                description: "Could not copy to clipboard.",
                variant: "destructive",
            });
        });
    };

    const handleConfirmSubscription = () => {
        if (!user || !dbUser) {
            toast({ title: "Please Log In", description: "You must be logged in to subscribe.", variant: "destructive" });
            router.push('/login');
            return;
        }
        
        startTransition(async () => {
            const result = await createSubscriptionRequest({
                userId: user.uid,
                userName: dbUser.name,
                userEmail: dbUser.email,
                paymentMethod: 'UPI',
            });

            if (result.success && result.subscriptionId) {
                toast({ title: "Request Sent!", description: "Your subscription request has been sent to the admin." });
                router.push(`/subscription-confirmation/${result.subscriptionId}`);
            } else {
                toast({ title: "Order Failed", description: result.error || "Could not save your subscription request.", variant: "destructive" });
            }
        });
    };


    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                    Confirm Your Subscription
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    You're one step away from unlocking full access. Follow the steps below to complete your payment.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left side: Feature list */}
                <div className="order-2 lg:order-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Star className="h-6 w-6" />
                                What You Get
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-4">
                                {includedFeatures.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                             <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                                <p className="font-bold text-primary">₹100 per month</p>
                                <p className="text-sm text-muted-foreground">All features included. Cancel anytime.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Right side: Payment options */}
                <div className="order-1 lg:order-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Instructions</CardTitle>
                             <CardDescription>
                                Complete your payment using UPI.
                            </CardDescription>
                        </CardHeader>
                         <CardContent>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <p className="text-sm text-muted-foreground">Scan the QR code with any UPI app to pay ₹100. <strong className="text-blue-500">After paying, you must click the "Confirm" button below.</strong></p>
                                <div className="p-2 border-4 border-primary rounded-lg bg-white">
                                     <Image
                                        src="/images/payment_qr.png"
                                        alt="UPI QR Code"
                                        width={200}
                                        height={200}
                                        data-ai-hint="qr code"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">Or copy the UPI ID:</p>
                                <div className="w-full flex items-center p-2 rounded-md bg-muted border">
                                    <p className="flex-1 font-mono text-sm">{UPI_ID}</p>
                                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(UPI_ID, 'UPI ID')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter className="flex-col gap-4 !p-6 border-t">
                            <h3 className="font-bold text-center">Step 2: Confirm Your Payment</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                After payment, click below to send a confirmation message on WhatsApp. Your subscription will be activated shortly after verification.
                            </p>
                            <Button className="w-full" onClick={handleConfirmSubscription} disabled={isPending}>
                               {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                               {isPending ? 'Processing...' : 'Confirm Subscription'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
