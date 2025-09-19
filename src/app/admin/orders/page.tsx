
import { getAllPrintOrders } from "@/lib/data";
import { Printer } from "lucide-react";
import { OrderList } from "@/components/admin/orders/OrderList";

export const revalidate = 0;

export default async function AdminPrintOrdersPage() {
  const allOrders = await getAllPrintOrders();

  const pendingOrders = allOrders.filter(o => o.status === 'pending');
  const completedOrders = allOrders.filter(o => o.status === 'completed');
  const cancelledOrders = allOrders.filter(o => o.status === 'cancelled');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Printer className="w-8 h-8 text-primary" />
          Print Order Management
        </h1>
        <p className="text-muted-foreground">
          Review and manage user requests for printed notes.
        </p>
      </header>

      <OrderList 
        pending={pendingOrders}
        completed={completedOrders}
        cancelled={cancelledOrders}
      />

    </div>
  );
}
