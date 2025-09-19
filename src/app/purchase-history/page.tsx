
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { History, Clock, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';
import { getUserPrintOrders } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import type { PrintOrder } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const OrderCard = ({ order }: { order: PrintOrder }) => {
    const statusConfig = {
        pending: {
            variant: "secondary",
            icon: Clock,
            className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800"
        },
        completed: {
            variant: "default",
            icon: CheckCircle,
            className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800"
        },
        cancelled: {
            variant: "destructive",
            icon: XCircle,
            className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800"
        }
    };
    
    const config = statusConfig[order.status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                           <FileText className="h-5 w-5 text-primary"/> {order.noteType}
                        </CardTitle>
                        <CardDescription>{order.noteSubject} &gt; {order.noteChapter}</CardDescription>
                    </div>
                     <Badge className={cn("capitalize", config.className)}>
                        <Icon className="mr-1.5 h-3 w-3" />
                        {order.status}
                    </Badge>
                </div>
            </CardHeader>
            {order.instructions && (
                <CardContent>
                    <div className="p-3 border rounded-md bg-muted/50">
                        <h4 className="font-semibold text-sm mb-2">Your Instructions</h4>
                        <p className="text-sm whitespace-pre-wrap">{order.instructions}</p>
                    </div>
                </CardContent>
            )}
            <CardFooter className="bg-muted/30 p-3 text-right">
                 <p className="text-xs text-muted-foreground w-full">
                    Ordered on: {format(new Date(order.createdAt), 'PPP p')}
                </p>
            </CardFooter>
        </Card>
    )
}

export default function PurchaseHistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<PrintOrder[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }
        
        if (user) {
            setIsLoadingOrders(true);
            getUserPrintOrders(user.uid)
                .then(userOrders => {
                    setOrders(userOrders);
                })
                .catch(error => {
                    console.error("Failed to fetch orders:", error);
                    setOrders([]);
                })
                .finally(() => {
                    setIsLoadingOrders(false);
                });
        } else {
            setIsLoadingOrders(false);
        }
    }, [user, authLoading]);
    
    const isLoading = authLoading || isLoadingOrders;

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <History className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Your Order History
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          View your print order records and their status.
        </p>
      </header>
      <main className="max-w-4xl mx-auto">
        {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : !user ? (
            <Card>
                <CardHeader>
                    <CardTitle>Please Log In</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        You need to be logged in to view your order history.
                    </p>
                </CardContent>
            </Card>
        ) : orders.length > 0 ? (
           <div className="space-y-6">
             {orders.map(order => <OrderCard key={order.id} order={order} />)}
           </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Orders Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                You haven't placed any print orders yet.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
