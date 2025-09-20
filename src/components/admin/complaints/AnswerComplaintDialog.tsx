
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { resolveComplaint } from "@/lib/data";
import type { Complaint } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { Send } from "lucide-react";

const formSchema = z.object({
  response: z.string().min(10, "Response must be at least 10 characters."),
});

interface AnswerComplaintDialogProps {
  complaint: Complaint;
  children?: React.ReactNode;
}

export function AnswerComplaintDialog({ complaint, children }: AnswerComplaintDialogProps) {
  const { user, dbUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const isEditing = complaint.status === 'resolved';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      response: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
          response: complaint.response || "",
      });
    }
  }, [isOpen, complaint, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !dbUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to respond.", variant: "destructive" });
        return;
    }
    
    startTransition(async () => {
      const result = await resolveComplaint(complaint.id, values.response, dbUser.name, user.uid);
      if (result.success) {
        toast({
          title: isEditing ? "Response Updated" : "Complaint Resolved",
          description: isEditing ? "The response has been updated." : "The user has been notified.",
        });
        setIsOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Operation Failed",
          description: result.error || "Could not save the response.",
          variant: "destructive",
        });
      }
    });
  }

  const triggerButton = children ? (
    children
  ) : (
    <Button size="sm">
      <Send className="mr-2 h-4 w-4" />
      Resolve
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Response' : `Respond to ${complaint.userName}`}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'You are editing a previously sent response.' : 'Your response will be visible to the user.'}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 p-4 border rounded-md bg-muted/50">
            <p className="font-semibold text-sm mb-1">Complaint:</p>
            <p className="text-sm">{complaint.content}</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="response"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Response</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., We have looked into the issue and..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (isEditing ? "Saving..." : "Sending...") : (isEditing ? "Save Changes" : "Send Response")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
