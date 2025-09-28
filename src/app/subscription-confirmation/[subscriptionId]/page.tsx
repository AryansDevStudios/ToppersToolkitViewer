
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { getSubscriptionById, getUserById } from '@/lib/data';
import type { Subscription, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const SELLER_WHATSAPP_NUMBER = "917754000411";

export default function SubscriptionConfirmationPage() {
    const params = useParams();
    const subscriptionId = params.subscriptionId as string;
    const router = useRouter();
    const { toast } = useToast();

    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [customer, setCustomer] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(10);
    const [whatsAppUrl, setWhatsAppUrl] = useState('');

    useEffect(() => {
        if (!subscriptionId) {
            router.push('/');
            return;
        }

        async function fetchSubscriptionAndCustomer() {
            setLoading(true);
            try {
                const subData = await getSubscriptionById(subscriptionId);
                if (!subData) {
                    toast({ title: "Error", description: "Subscription request not found.", variant: "destructive" });
                    router.push('/subscribe');
                    return;
                }
                setSubscription(subData);
                
                const customerData = await getUserById(subData.userId);
                if (!customerData) {
                    toast({ title: "Error", description: "Customer data not found.", variant: "destructive" });
                    router.push('/subscribe');
                    return;
                }
                setCustomer(customerData);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load subscription details.", variant: "destructive" });
                router.push('/subscribe');
            } finally {
                setLoading(false);
            }
        }

        fetchSubscriptionAndCustomer();
    }, [subscriptionId, router, toast]);

    useEffect(() => {
        if (subscription && customer) {
            const generateWhatsAppMessage = () => {
                const paymentDetails = subscription.paymentMethod === 'UPI'
                    ? "I have completed the payment of ₹100 via UPI. Please find the transaction details attached after this message."
                    : "I would like to pay ₹100 in cash. Please let me know when and where we can meet to complete the transaction.";
                
                const messageTemplate = 
`Hello! I want to subscribe to Topper's Toolkit.

*My Details:*
*Name:* ${customer.name}
*Email:* ${customer.email}
*User ID:* ${customer.id}

*Payment Method Chosen: ${subscription.paymentMethod}*

${paymentDetails}

Please activate my full subscription upon verification. Thank you!`;

                return messageTemplate;
            };

            const message = generateWhatsAppMessage();
            setWhatsAppUrl(`https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
        }
    }, [subscription, customer]);

    useEffect(() => {
        if (loading || !whatsAppUrl) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            window.location.href = whatsAppUrl;
        }
    }, [countdown, loading, whatsAppUrl]);

    const handleOpenWhatsApp = () => {
        if (whatsAppUrl) {
            window.location.href = whatsAppUrl;
        }
    };
    
    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-lg px-4 py-12">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Subscription Request Sent!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <div className="text-left bg-muted/50 p-4 rounded-lg">
                        <p className="font-bold">What's Next?</p>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1 text-muted-foreground">
                            <li>You will be redirected to WhatsApp in a moment.</li>
                            <li>A message with your subscription details will be pre-filled.</li>
                            <li><strong className="text-foreground">Please do not edit the message.</strong></li>
                            <li>Simply press the <strong className="text-foreground">Send</strong> button to finalize your request with the seller.</li>
                        </ul>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Redirecting to WhatsApp in...</p>
                        <p className="text-4xl font-bold">{countdown}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button onClick={handleOpenWhatsApp}>
                            Send on WhatsApp Now
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/')}>
                            Go to Homepage
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
