
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateSettings } from "@/lib/data";
import type { AppSettings } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  printCostPerPage: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "Cost must be a positive number." })
  ),
});

interface SettingsFormProps {
  initialSettings: AppSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      printCostPerPage: initialSettings.printCostPerPage || 1,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await updateSettings(values);
      if (result.success) {
        toast({ title: "Settings Updated", description: "The new settings have been saved." });
        router.refresh();
      } else {
        toast({ title: "Update Failed", description: result.error, variant: "destructive" });
      }
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Printing Cost</CardTitle>
            </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="printCostPerPage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Per Page (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set the price for printing a single side of a page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
