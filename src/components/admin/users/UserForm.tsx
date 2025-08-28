
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUser } from "@/lib/data";
import { User } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Full Name is required." }),
  class: z.string().optional(),
  section: z.string().optional(),
  gender: z.string().optional(),
  srNo: z.string().length(4, { message: "SR. No. must be 4 digits."}).regex(/^\d{4}$/, { message: "SR. No. must be a 4-digit number."}),
  email: z.string().email(),
  password: z.string().optional(),
  whatsappNumber: z.string().optional(),
}).refine(data => {
    // This validation is more for the form state, not strictly needed for update
    // as the fields might be empty if the role changes. We handle logic in onSubmit.
    return true;
});


interface UserFormProps {
  user: User;
}

export function UserForm({ user }: UserFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [initialClass, initialSection] = (user.classAndSection || '').split(' ');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      class: initialClass ? initialClass.replace('th', '') : '',
      section: initialSection || '',
      gender: user.gender || '',
      srNo: user.srNo || "",
      email: user.email || "",
      password: user.password || "",
      whatsappNumber: user.whatsappNumber || "",
    },
  });

  const studentClass = form.watch("class");

  const getSectionOptions = () => {
      if (!studentClass) return [];
      const classNum = parseInt(studentClass);
      if (classNum === 11 || classNum === 12) {
          return ["Biology", "Maths", "Commerce"];
      }
      return ["A", "B", "C"];
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        let classAndSection: string | undefined = undefined;
        if (user.role === 'Student' && values.class && values.section) {
            classAndSection = `${values.class}th ${values.section}`;
        }
        
        const dataToUpdate: Partial<User> = {
          name: values.name.trim(),
          classAndSection: classAndSection,
          gender: user.role === 'Teacher' ? values.gender : undefined,
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

        {user.role === 'Student' && (
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                                        <SelectItem key={num} value={String(num)}>{num}th</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Section</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value} disabled={!studentClass}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {getSectionOptions().map(sec => (
                                        <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        )}

        {user.role === 'Teacher' && (
            <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )}
        
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

    