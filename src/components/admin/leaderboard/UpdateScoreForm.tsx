
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUser } from "@/lib/data";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  score: z.coerce.number().int().min(0, "Score must be a positive number."),
});

interface UpdateScoreFormProps {
  userId: string;
  currentScore: number;
}

export function UpdateScoreForm({ userId, currentScore }: UpdateScoreFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: currentScore,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await upsertUser({
        id: userId,
        score: values.score,
      });

      if (result.success) {
        toast({
          title: "Score Updated",
          description: "The user's score has been successfully updated.",
        });
        router.refresh();
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Could not update the score.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 justify-end">
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  className="w-24 text-right"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
