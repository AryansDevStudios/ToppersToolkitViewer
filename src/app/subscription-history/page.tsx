
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Clock, CheckCircle, Star } from 'lucide-react';
import { getUserSubscriptions } from '@/lib/data';
import type { Subscription } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export const revalidate = 0;

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


export default async function SubscriptionHistoryPage() {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    const subscriptions = await getUserSubscriptions(user.id);

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
        {subscriptions.length > 0 ? (
            <div className="space-y-6">
                {subscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
            </div>
        ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold">No Subscription History</h2>
              <p className="mt-2">You haven't made any subscription requests yet.</p>
            </div>
        )}
      </main>
    </div>
  );
}
