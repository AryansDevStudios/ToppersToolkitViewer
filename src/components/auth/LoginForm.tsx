
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
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { updatePasswordInFirestore, logUserLogin } from "@/lib/data";
import type { LoginLog } from "@/lib/types";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
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

// Helper function to get GPU information
const getGpuInfo = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                return `${vendor} - ${renderer}`;
            }
        }
    } catch (e) {
        // Silently fail in production
    }
    return "Unknown";
};


export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // Update the password in Firestore after a successful login.
      await updatePasswordInFirestore(userCredential.user.uid, values.password);

      // --- Device Info Logging ---
      const { userAgent, platform, hardwareConcurrency, deviceMemory } = navigator;
      const { width, height } = window.screen;
      const { os, browser } = getOSAndBrowser(userAgent);
      const gpuInfo = getGpuInfo();

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
        gpuInfo,
      };

      await logUserLogin(userCredential.user.uid, loginLog);
      // --- End Logging ---

      toast({
        title: "Login Successful",
        description: "Redirecting you to the dashboard.",
      });
      router.push("/");
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        form.setError('email', {
            type: 'manual',
            message: "No user found with this email address."
        });
      } else if (error.code === 'auth/wrong-password') {
         form.setError('password', {
            type: 'manual',
            message: "Incorrect password. Please try again."
        });
      } else {
         form.setError('root.serverError', {
            type: 'manual',
            message: error.message
        });
      }
    } finally {
        setIsSubmitting(false);
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
             {form.formState.errors.root?.serverError && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.serverError.message}
              </p>
            )}
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
                      Agree to our Terms and Conditions
                    </FormLabel>
                    <FormDescription>
                      You agree to our{" "}
                      <Link href="/terms" className="underline hover:text-primary" target="_blank">
                        Terms and Conditions
                      </Link>
                      .
                    </FormDescription>
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={!form.watch('agreeToTerms') || isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
