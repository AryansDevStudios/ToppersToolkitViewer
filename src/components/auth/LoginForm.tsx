
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
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.98 12.18c0-.83-.07-1.64-.2-2.43H12v4.65h5.04c-.21.82-.84 2.1-2.04 2.92v3.08h3.96c2.31-2.13 3.63-5.22 3.63-8.22z" />
        <path d="M12 21c3.24 0 5.95-1.08 7.93-2.91l-3.96-3.08c-1.08.73-2.45 1.16-4 1.16-3.08 0-5.68-2.09-6.6-4.91H1.4v3.17A11.97 11.97 0 0 0 12 21z" />
        <path d="M5.4 14.09c-.22-.65-.34-1.34-.34-2.04s.12-1.39.34-2.04V6.83H1.4a11.97 11.97 0 0 0 0 10.34l4-3.08z" />
        <path d="M12 5.35c1.75 0 3.32.61 4.55 1.78l3.4-3.4A11.93 11.93 0 0 0 12 2.05 11.97 11.97 0 0 0 .1 9.82l4.08 3.14C5.12 7.44 8.62 5.35 12 5.35z" />
      </svg>
    )
}

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login Successful",
        description: "Redirecting you to the dashboard.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // The useAuth hook will handle redirects and session state.
      // We just need to ensure the user document exists.
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
         // This is a new user, create their document
         await setDoc(userDocRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            role: "User",
        });
      }
      
      toast({
        title: "Sign-In Successful",
        description: "Welcome! Redirecting you now.",
      });
      router.push("/");

    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
            title: "Sign-In Cancelled",
            description: "The sign-in popup was closed. Please try again.",
            variant: "destructive",
        });
      } else {
        toast({
            title: "Google Sign-In Failed",
            description: error.message,
            variant: "destructive",
        });
      }
    }
  };


  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
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
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full">
              Sign In
            </Button>
             <div className="relative w-full">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                </span>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Google
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
