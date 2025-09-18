

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
import { answerDoubt } from "@/lib/data";
import type { Doubt } from "@/lib/types";
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
  answer: z.string().min(10, "Answer must be at least 10 characters."),
});

interface AnswerDoubtDialogProps {
  doubt: Doubt;
  children?: React.ReactNode;
}

export function AnswerDoubtDialog({ doubt, children }: AnswerDoubtDialogProps) {
  const { user, dbUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const isEditing = doubt.status === 'answered';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
          answer: doubt.answer || "",
      });
    }
  }, [isOpen, doubt, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !dbUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to answer.", variant: "destructive" });
        return;
    }
    
    startTransition(async () => {
      const result = await answerDoubt(doubt.id, values.answer, dbUser.name, user.uid);
      if (result.success) {
        toast({
          title: isEditing ? "Reply Updated" : "Reply Sent",
          description: isEditing ? "The reply has been updated." : "The user has been notified.",
        });
        setIsOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Operation Failed",
          description: result.error || "Could not save the reply.",
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
      Answer
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Reply' : `Reply to ${doubt.userName}`}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'You are editing a previously sent reply.' : 'Your answer will be visible to the student.'}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 p-4 border rounded-md bg-muted/50">
            <p className="font-semibold text-sm mb-1">Question:</p>
            <p className="text-sm">{doubt.question}</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Answer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., The formula for photosynthesis is..."
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
                {isPending ? (isEditing ? "Saving..." : "Sending...") : (isEditing ? "Save Changes" : "Send Reply")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
