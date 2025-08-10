
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
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, db, createUserWithEmailAndPassword, updateProfile, doc, setDoc } from "@/lib/firebase";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";

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

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-md font-semibold font-headline mt-4 mb-2">{children}</h3>
);

const ListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="mb-2 pl-4 text-xs relative before:content-['•'] before:absolute before:left-0 before:text-primary">{children}</li>
);


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

      // Storing password in Firestore (Security Risk)
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name,
        email,
        password, // Storing plaintext password
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
                  <FormLabel>Password</FormLabel>
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
                 <FormItem>
                    <div className="space-y-2 rounded-md border p-4">
                        <h3 className="font-semibold text-center">Terms and Conditions</h3>
                        <ScrollArea className="h-48 w-full p-3 rounded-md bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">
                                Welcome to <strong>Topper’s Toolkit Viewer</strong>, owned and operated by <strong>Aryan Gupta (AryansDevStudios)</strong>.
                                By accessing purchased notes on this platform, you agree to the following Terms.
                            </p>
                            <SectionTitle>1. Access Rights</SectionTitle>
                            <ul className="text-muted-foreground">
                                <ListItem>Access is granted <strong>only to verified purchasers</strong> from Topper’s Toolkit Shop.</ListItem>
                                <ListItem>Your account is for <strong>personal use only</strong>.</ListItem>
                                <ListItem>You do <strong>not</strong> own the content you view — all rights remain with <strong>Kuldeep Singh</strong>.</ListItem>
                            </ul>

                            <SectionTitle>2. Restrictions on Use</SectionTitle>
                            <p className="text-xs text-muted-foreground">You are strictly prohibited from:</p>
                            <ul className="text-muted-foreground">
                                <ListItem>Downloading, saving, or copying any notes.</ListItem>
                                <ListItem>Taking screenshots or screen recordings.</ListItem>
                                <ListItem>Printing any part of the notes.</ListItem>
                                <ListItem>Sharing your account login with others.</ListItem>
                                <ListItem>Selling, redistributing, or publishing the content.</ListItem>
                            </ul>

                            <SectionTitle>3. Anti-Piracy Notice</SectionTitle>
                            <p className="text-xs text-muted-foreground">
                                We actively monitor for unauthorized sharing and may embed digital tracking within our notes to trace leaks.
                                Any violation will result in <strong>immediate account suspension</strong> and possible <strong>legal action</strong>.
                            </p>
                             <SectionTitle>4. Enforcement Actions</SectionTitle>
                            <p className="text-xs text-muted-foreground">If you are found violating these Terms, the Owner/Seller may:</p>
                            <ul className="text-muted-foreground">
                                <ListItem>Temporarily suspend or permanently terminate your account.</ListItem>
                                <ListItem>Remove access to specific notes or your entire library without refund.</ListItem>
                                <ListItem>Take legal measures to recover damages.</ListItem>
                            </ul>

                             <SectionTitle>5. Agreement Requirement</SectionTitle>
                            <p className="text-xs text-muted-foreground">
                                You must explicitly agree to these Terms to create an account. Use of this platform implies full acceptance.
                            </p>
                        </ScrollArea>
                        <div className="flex items-center space-x-2 pt-2">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="terms-checkbox"
                                />
                            </FormControl>
                            <div className="grid gap-1.5 leading-none">
                                <label
                                htmlFor="terms-checkbox"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                I have read and agree to the Terms and Conditions.
                                </label>
                            </div>
                        </div>
                    </div>
                    <FormMessage />
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

