
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { History, Clock, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';
import { getUserPrintOrders } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import type { PrintOrder } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OrderCard = ({ order }: { order: PrintOrder }) => {
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
                     <Badge variant={order.status === 'completed' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
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

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const completedOrders = orders.filter(o => o.status === 'completed');
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');

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
           <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">
                        <Clock className="mr-2 h-4 w-4"/> Pending ({pendingOrders.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        <CheckCircle className="mr-2 h-4 w-4"/> Completed ({completedOrders.length})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled">
                        <XCircle className="mr-2 h-4 w-4"/> Cancelled ({cancelledOrders.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-6">
                    {pendingOrders.length > 0 ? (
                        <div className="space-y-4">
                            {pendingOrders.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    ) : <p className="text-center text-muted-foreground py-16">You have no pending orders.</p>}
                </TabsContent>
                <TabsContent value="completed" className="mt-6">
                    {completedOrders.length > 0 ? (
                        <div className="space-y-4">
                            {completedOrders.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    ) : <p className="text-center text-muted-foreground py-16">You have no completed orders.</p>}
                </TabsContent>
                <TabsContent value="cancelled" className="mt-6">
                    {cancelledOrders.length > 0 ? (
                        <div className="space-y-4">
                            {cancelledOrders.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    ) : <p className="text-center text-muted-foreground py-16">You have no cancelled orders.</p>}
                </TabsContent>
            </Tabs>
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
