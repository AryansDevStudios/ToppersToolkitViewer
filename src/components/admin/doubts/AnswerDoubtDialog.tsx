
"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { Doubt } from "@/lib/types";
import { answerDoubt } from "@/lib/data";
import { Loader2, Send } from "lucide-react";

const formSchema = z.object({
  answer: z.string().min(10, { message: "Answer must be at least 10 characters." }),
});

interface AnswerDoubtDialogProps {
  doubt: Doubt;
}

export function AnswerDoubtDialog({ doubt }: AnswerDoubtDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth(); // We need the admin's info

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user?.uid || !user.displayName) {
        toast({ title: "Error", description: "You must be logged in to answer.", variant: "destructive" });
        return;
    }
    
    startTransition(async () => {
      const result = await answerDoubt(doubt.id, values.answer, user.uid, user.displayName!);
      if (result.success) {
        toast({ title: "Answer Submitted", description: "The student will be notified." });
        setIsOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error || "Could not submit answer.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
            <Send className="mr-2 h-4 w-4" />
            Answer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reply to Doubt</DialogTitle>
          <DialogDescription>
            Provide an answer to the student's question.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
            <p className="font-semibold text-sm">Student's Question:</p>
            <p className="text-sm bg-muted p-3 rounded-md mt-1">{doubt.question}</p>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Answer</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Type your detailed answer here..."
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
                    {isPending ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                        </>
                    ) : (
                        "Submit Answer"
                    )}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
