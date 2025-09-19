
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, MessageSquare } from 'lucide-react';
import { getPrintOrderById, getUserById } from '@/lib/data';
import type { PrintOrder, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const SELLER_WHATSAPP_NUMBER = "917754000411"; // Replace with the actual seller's number

export default function OrderConfirmationPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const router = useRouter();
    const { toast } = useToast();

    const [order, setOrder] = useState<PrintOrder | null>(null);
    const [customer, setCustomer] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(10);
    const [whatsAppUrl, setWhatsAppUrl] = useState('');

    useEffect(() => {
        if (!orderId) {
            router.push('/');
            return;
        }

        async function fetchOrderAndCustomer() {
            setLoading(true);
            try {
                const orderData = await getPrintOrderById(orderId);
                if (!orderData) {
                    toast({ title: "Error", description: "Order not found.", variant: "destructive" });
                    router.push('/');
                    return;
                }
                setOrder(orderData);
                
                const customerData = await getUserById(orderData.userId);
                if (!customerData) {
                    toast({ title: "Error", description: "Customer data not found.", variant: "destructive" });
                    router.push('/');
                    return;
                }
                setCustomer(customerData);

            } catch (error) {
                toast({ title: "Error", description: "Failed to load order details.", variant: "destructive" });
                router.push('/');
            } finally {
                setLoading(false);
            }
        }

        fetchOrderAndCustomer();
    }, [orderId, router, toast]);

    useEffect(() => {
        if (order && customer) {
            const generateWhatsAppMessage = () => {
                const customerName = customer.name || 'N/A';
                const customerClass = customer.classAndSection || 'N/A';
                const customerWhatsapp = customer.whatsappNumber.replace(/\D/g, '');

                const itemsList = 
                    `Note: ${order.noteType}\n` +
                    `Chapter: ${order.noteChapter}\n` +
                    `Subject: ${order.noteSubject}`;
                
                const priceText = order.price ? `₹${order.price.toFixed(2)}` : 'To be confirmed';

                const specialInstructions = order.instructions || 'None';

                const messageTemplate = 
`Hello Kuldeep! You have a new print order from Topper's Toolkit.
*Customer Details:*
Name: ${customerName}
Class: ${customerClass}
WhatsApp: wa.me/${customerWhatsapp}

*Order Details:*
${itemsList}

Estimated Price: *${priceText}*

Special Instructions: ${specialInstructions}

Note: Please visit the admin panel to verify details and update the order status.`;

                return messageTemplate;
            };

            const message = generateWhatsAppMessage();
            setWhatsAppUrl(`https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
        }
    }, [order, customer]);

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
                    <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <div className="text-left bg-muted/50 p-4 rounded-lg">
                        <p className="font-bold">What's Next?</p>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1 text-muted-foreground">
                            <li>You will be redirected to WhatsApp in a moment.</li>
                            <li>A message with your order details will be pre-filled.</li>
                            <li><strong className="text-foreground">Please do not edit the message.</strong></li>
                            <li>Simply press the <strong className="text-foreground">Send</strong> button to finalize your order with the seller.</li>
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

