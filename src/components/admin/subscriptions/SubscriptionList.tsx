
"use client";

import type { Subscription } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Clock, Edit } from "lucide-react";
import { format } from 'date-fns';
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { completeSubscription } from "@/lib/data";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";


const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await completeSubscription(subscription.id, subscription.userId);
      if (result.success) {
        toast({ title: "Subscription Approved", description: `${subscription.userName} now has full access.` });
        router.refresh();
      } else {
        toast({ title: "Approval Failed", description: result.error, variant: "destructive" });
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg">{subscription.userName}</CardTitle>
                <CardDescription>{subscription.userEmail}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Badge variant={subscription.paymentMethod === 'UPI' ? 'default' : 'secondary'}>
                    {subscription.paymentMethod}
                </Badge>
                <Badge variant={subscription.status === 'completed' ? 'default' : 'secondary'}>
                    {subscription.status}
                </Badge>
            </div>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between items-center bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
            {subscription.status === 'pending' ? 'Requested on:' : 'Completed on:'}
            {' '}
            {format(new Date(subscription.status === 'pending' ? subscription.createdAt : subscription.completedAt || subscription.createdAt), 'PPP p')}
        </p>
         {subscription.status === 'pending' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={isPending}>
                  {isPending ? 'Approving...' : 'Approve Subscription'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will grant <strong className="text-foreground">{subscription.userName}</strong> full, permanent access to all notes and mark this subscription as complete. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApprove} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Confirm & Grant Access
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
         )}
      </CardFooter>
    </Card>
  );
};


interface SubscriptionListProps {
  pending: Subscription[];
  completed: Subscription[];
}

export function SubscriptionList({ pending, completed }: SubscriptionListProps) {
  return (
    <Tabs defaultValue="pending">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pending">
            <Clock className="mr-2 h-4 w-4"/> Pending ({pending.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
            <Check className="mr-2 h-4 w-4"/> Completed ({completed.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="mt-6">
        {pending.length > 0 ? (
            <div className="space-y-4">
                {pending.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
            </div>
        ) : <p className="text-center text-muted-foreground py-16">No pending subscription requests.</p>}
      </TabsContent>
       <TabsContent value="completed" className="mt-6">
        {completed.length > 0 ? (
            <div className="space-y-4">
                {completed.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
            </div>
        ) : <p className="text-center text-muted-foreground py-16">No completed subscriptions yet.</p>}
      </TabsContent>
    </Tabs>
  );
}
