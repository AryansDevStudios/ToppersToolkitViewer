
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
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, db, createUserWithEmailAndPassword, updateProfile, doc, setDoc } from "@/lib/firebase";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, { message: "Full Name is required." }),
  classAndSection: z.string().min(1, { message: "Class & Section is required."}),
  username: z.string().min(1, { message: "Username is required."}),
  srNo: z.string().length(4, { message: "SR. No. must be 4 digits."}).regex(/^\d{4}$/, { message: "SR. No. must be a 4-digit number."}),
  email: z.string().email({ message: "Please enter a valid email."}),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});


export function RegisterForm() {
    const { toast } = useToast();
    const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      classAndSection: "",
      username: "",
      srNo: "",
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { email, password, name, classAndSection, srNo, username } = values;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name,
        email,
        password, 
        classAndSection,
        srNo,
        username,
        role: "User",
        createdAt: Date.now(),
      });

      toast({
        title: "Registration Successful",
        description: "Welcome! Please log in to continue.",
      });
      router.push("/login");
    } catch (error: any) {
       toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
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
                  <FormLabel>Create Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                       I have read and agree to the Terms and Conditions.
                    </FormLabel>
                    <FormDescription>
                      Please read the{" "}
                      <Link href="/terms" className="underline hover:text-primary" target="_blank">
                        Terms and Conditions
                      </Link> before proceeding.
                    </FormDescription>
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={!form.watch('agreeToTerms')}>
              Create Account
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
