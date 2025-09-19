
"use client";

import type { PrintOrder } from "@/lib/types";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MoreVertical, Check, X, Clock, FileText } from "lucide-react";
import { format } from 'date-fns';
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { updatePrintOrderStatus } from "@/lib/data";
import { useRouter } from "next/navigation";

const OrderCard = ({ order }: { order: PrintOrder }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusChange = (newStatus: 'completed' | 'cancelled') => {
    startTransition(async () => {
      const result = await updatePrintOrderStatus(order.id, newStatus);
      if (result.success) {
        toast({ title: "Status Updated", description: `Order marked as ${newStatus}.` });
        router.refresh();
      } else {
        toast({ title: "Update Failed", description: result.error, variant: "destructive" });
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg">{order.userName}</CardTitle>
                <CardDescription>{order.userEmail}</CardDescription>
            </div>
            <Badge variant={order.status === 'completed' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
                {order.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 border rounded-md bg-muted/30">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><FileText className="h-4 w-4" />Note</h4>
            <p className="text-sm">{order.noteType}</p>
            <p className="text-xs text-muted-foreground">{order.noteSubject} &gt; {order.noteChapter}</p>
        </div>
        {order.instructions && (
             <div className="p-3 border rounded-md">
                <h4 className="font-semibold text-sm mb-2">Instructions</h4>
                <p className="text-sm whitespace-pre-wrap">{order.instructions}</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
            {format(new Date(order.createdAt), 'PPP p')}
        </p>
         {order.status === 'pending' && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isPending}>
                       {isPending ? 'Updating...': 'Update Status'} 
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                        <Check className="mr-2 h-4 w-4" /> Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('cancelled')} className="text-destructive">
                         <X className="mr-2 h-4 w-4" /> Mark as Cancelled
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
         )}
      </CardFooter>
    </Card>
  );
};


interface OrderListProps {
  pending: PrintOrder[];
  completed: PrintOrder[];
  cancelled: PrintOrder[];
}

export function OrderList({ pending, completed, cancelled }: OrderListProps) {
  return (
    <Tabs defaultValue="pending">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">
            <Clock className="mr-2 h-4 w-4"/> Pending ({pending.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
            <Check className="mr-2 h-4 w-4"/> Completed ({completed.length})
        </TabsTrigger>
        <TabsTrigger value="cancelled">
            <X className="mr-2 h-4 w-4"/> Cancelled ({cancelled.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="mt-6">
        {pending.length > 0 ? (
            <div className="space-y-4">
                {pending.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
        ) : <p className="text-center text-muted-foreground py-16">No pending orders.</p>}
      </TabsContent>
       <TabsContent value="completed" className="mt-6">
        {completed.length > 0 ? (
            <div className="space-y-4">
                {completed.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
        ) : <p className="text-center text-muted-foreground py-16">No completed orders.</p>}
      </TabsContent>
       <TabsContent value="cancelled" className="mt-6">
        {cancelled.length > 0 ? (
            <div className="space-y-4">
                {cancelled.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
        ) : <p className="text-center text-muted-foreground py-16">No cancelled orders.</p>}
      </TabsContent>
    </Tabs>
  );
}

