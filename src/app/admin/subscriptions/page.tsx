
import { getAllSubscriptions } from "@/lib/data";
import { Star } from "lucide-react";
import { SubscriptionList } from "@/components/admin/subscriptions/SubscriptionList";

export const revalidate = 0;

export default async function AdminSubscriptionsPage() {
  const allSubscriptions = await getAllSubscriptions();

  const pendingSubscriptions = allSubscriptions.filter(s => s.status === 'pending');
  const completedSubscriptions = allSubscriptions.filter(s => s.status === 'completed');
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Star className="w-8 h-8 text-primary" />
          Subscription Requests
        </h1>
        <p className="text-muted-foreground">
          Review and approve user subscription requests.
        </p>
      </header>

      <SubscriptionList 
        pending={pendingSubscriptions}
        completed={completedSubscriptions}
      />

    </div>
  );
}
