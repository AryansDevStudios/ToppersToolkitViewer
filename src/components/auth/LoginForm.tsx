
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
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { updatePasswordInFirestore, logUserLogin } from "@/lib/data";
import type { LoginLog } from "@/lib/types";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

// Helper function to get OS and Browser from User Agent
const getOSAndBrowser = (userAgent: string) => {
    let os = "Unknown";
    if (userAgent.indexOf("Win") != -1) os = "Windows";
    if (userAgent.indexOf("Mac") != -1) os = "MacOS";
    if (userAgent.indexOf("X11") != -1) os = "UNIX";
    if (userAgent.indexOf("Linux") != -1) os = "Linux";
    if (userAgent.indexOf("Android") != -1) os = "Android";
    if (userAgent.indexOf("like Mac") != -1) os = "iOS";

    let browser = "Unknown";
    if (userAgent.indexOf("Chrome") != -1 ) browser = "Chrome";
    if (userAgent.indexOf("Firefox") != -1 ) browser = "Firefox";
    if (userAgent.indexOf("Safari") != -1 && userAgent.indexOf("Chrome") == -1) browser = "Safari";
    if (userAgent.indexOf("MSIE") != -1 || userAgent.indexOf("Trident/") != -1) browser = "Internet Explorer";

    return { os, browser };
};


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
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // Update the password in Firestore after a successful login.
      await updatePasswordInFirestore(userCredential.user.uid, values.password);

      // --- Device Info Logging ---
      const { userAgent, platform, hardwareConcurrency, deviceMemory } = navigator;
      const { width, height } = window.screen;
      const { os, browser } = getOSAndBrowser(userAgent);

      const deviceType = /Mobi|Android/i.test(userAgent) ? 'Mobile' : /Tablet/i.test(userAgent) ? 'Tablet' : 'Desktop';

      const loginLog: Omit<LoginLog, 'timestamp'> = {
        userAgent,
        platform,
        deviceType,
        os,
        browser,
        screenResolution: `${width}x${height}`,
        pointingMethod: 'ontouchstart' in window ? 'Touchscreen' : 'Mouse',
        ram: deviceMemory,
        cpuCores: hardwareConcurrency,
      };

      await logUserLogin(userCredential.user.uid, loginLog);
      // --- End Logging ---

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
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
