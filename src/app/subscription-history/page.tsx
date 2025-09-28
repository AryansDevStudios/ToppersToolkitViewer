
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { History, Clock, CheckCircle, Star, Loader2 } from 'lucide-react';
import { getUserSubscriptions } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import type { Subscription } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => {
    const statusConfig = {
        pending: { icon: Clock, className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800" },
        completed: { icon: CheckCircle, className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800" }
    };
    const config = statusConfig[subscription.status];
    const Icon = config.icon;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Full Access Subscription</CardTitle>
                    <Badge className={cn("capitalize", config.className)}>
                        <Icon className="mr-1.5 h-3 w-3" />
                        {subscription.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Payment Method: <span className="font-semibold">{subscription.paymentMethod}</span>
                </p>
            </CardContent>
            <CardFooter className="bg-muted/30 p-3 text-right">
                 <p className="text-xs text-muted-foreground w-full">
                    {subscription.status === 'pending' ? 'Requested on' : 'Completed on'}:{' '}
                    {format(new Date(subscription.status === 'completed' ? subscription.completedAt || subscription.createdAt : subscription.createdAt), 'PPP p')}
                </p>
            </CardFooter>
        </Card>
    );
};


export default function SubscriptionHistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) {
            setIsLoading(true);
            return;
        }
        if (!user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        getUserSubscriptions(user.uid)
        .then((userSubscriptions) => {
            setSubscriptions(userSubscriptions);
        }).catch(error => {
            console.error("Failed to fetch subscriptions:", error);
            setSubscriptions([]);
        }).finally(() => {
            setIsLoading(false);
        });

    }, [user, authLoading]);
    
    const displayLoading = authLoading || isLoading;

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Star className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Your Subscription History
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          View the status of all your subscription requests.
        </p>
      </header>
      <main className="max-w-4xl mx-auto">
        {displayLoading ? (
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
                        You need to be logged in to view your subscription history.
                    </p>
                </CardContent>
            </Card>
        ) : (
            subscriptions.length > 0 ? (
                <div className="space-y-6">
                    {subscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-16">
                    You haven't made any subscription requests yet.
                </p>
            )
        )}
      </main>
    </div>
  );
}
