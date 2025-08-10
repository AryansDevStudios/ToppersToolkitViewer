
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
import { useTransition, useState } from "react";
import { upsertUser } from "@/lib/data";
import { User } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit } from "lucide-react";
import { auth, updatePassword } from "@/lib/firebase";

const formSchema = z.object({
  name: z.string().min(1, { message: "Full Name is required." }),
  classAndSection: z.string().min(1, { message: "Class & Section is required."}),
  username: z.string().min(1, { message: "Username is required."}),
  srNo: z.string().length(4, { message: "SR. No. must be 4 digits."}).regex(/^\d{4}$/, { message: "SR. No. must be a 4-digit number."}),
  email: z.string().email(),
  password: z.string().optional(),
});

interface UserFormProps {
  user: User;
}

export function UserForm({ user }: UserFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      classAndSection: user.classAndSection || "",
      username: user.username || "",
      srNo: user.srNo || "",
      email: user.email || "",
      password: "" // Always start empty
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const dataToUpdate: Partial<User> = {
          name: values.name.trim(),
          classAndSection: values.classAndSection.trim(),
          username: values.username.trim(),
          srNo: values.srNo.trim(),
        };

        if (values.password) {
           const currentUser = auth.currentUser;
           if(currentUser && currentUser.uid === user.id) {
              await updatePassword(currentUser, values.password);
              toast({ title: "Auth Password Updated", description: "Firebase Auth password was changed." });
           } else {
             // Note: Updating other users' passwords client-side is not directly possible
             // and requires an admin SDK on a secure backend.
             // We will store it in firestore, but it won't work for login until the user logs in again.
             toast({ 
                title: "Security Warning", 
                description: "Password for other users can't be updated in Firebase Auth from the client. The new password is saved and will be active on next login.",
                variant: "destructive",
                duration: 8000
             });
           }
           dataToUpdate.password = values.password;
        }

        const result = await upsertUser({
          id: user.id,
          ...dataToUpdate
        });

        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          setIsOpen(false);
          router.refresh();
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
        </DialogHeader>
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password to update" {...field} autoComplete="new-password" />
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
            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
