
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import type { User } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { extendUserSubscription } from "@/lib/data";
import { addDays, format, fromUnixTime } from 'date-fns';

const formSchema = z.object({
  days: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().int().positive({ message: "Must be a positive number." })
  ),
});

interface ExtendSubscriptionDialogProps {
  user: User;
}

export function ExtendSubscriptionDialog({ user }: ExtendSubscriptionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: 30,
    },
  });

  const currentExpiryDate = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : new Date();

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const newExpiryDate = addDays(currentExpiryDate, values.days);
      const result = await extendUserSubscription(user.id, newExpiryDate.getTime());

      if (result.success) {
        toast({
          title: "Subscription Extended",
          description: `${user.name}'s subscription has been extended by ${values.days} days.`,
        });
        setIsOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Extension Failed",
          description: result.error || "Could not extend the subscription.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Extend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Subscription</DialogTitle>
          <DialogDescription>
            Extend the subscription period for {user.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 my-4 border rounded-md bg-muted/50">
            <p className="text-sm font-medium">Current Expiry Date</p>
            <p className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {format(currentExpiryDate, 'PPP p')}
            </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days to Extend</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Extending..." : "Confirm Extension"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
