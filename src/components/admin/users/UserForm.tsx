
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUser } from "@/lib/data";
import { User } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Full Name is required." }),
  classAndSection: z.string().min(1, { message: "Class & Section is required."}),
  username: z.string().min(1, { message: "Username is required."}),
  srNo: z.string().length(4, { message: "SR. No. must be 4 digits."}).regex(/^\d{4}$/, { message: "SR. No. must be a 4-digit number."}),
  email: z.string().email(),
  password: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

interface UserFormProps {
  user: User;
}

export function UserForm({ user }: UserFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      classAndSection: user.classAndSection || "",
      username: user.username || "",
      srNo: user.srNo || "",
      email: user.email || "",
      password: user.password || "",
      whatsappNumber: user.whatsappNumber || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const dataToUpdate: Omit<Partial<User>, 'id' | 'email' | 'password'> = {
          name: values.name.trim(),
          classAndSection: values.classAndSection.trim(),
          username: values.username.trim(),
          srNo: values.srNo.trim(),
          whatsappNumber: values.whatsappNumber?.trim(),
        };

        const result = await upsertUser({
          id: user.id,
          ...dataToUpdate
        });

        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          router.push('/admin/users');
        } else {
          throw new Error(result.error || "Could not update the user.");
        }

      } catch (error: any) {
        toast({
          title: "Operation Failed",
          description: error.message || "Could not update the user.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Read-only)</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} readOnly disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password (Read-only)</FormLabel>
              <FormControl>
                <Input type="text" {...field} readOnly disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="classAndSection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class & Section</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 10th A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="your_username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="srNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SR. No.</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="whatsappNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input placeholder="+91 12345 67890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
             <Button type="button" variant="outline" onClick={() => router.push('/admin/users')}>
                Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
