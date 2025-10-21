
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
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { updatePasswordInFirestore, logUserLogin } from "@/lib/data";
import type { LoginLog } from "@/lib/types";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

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

const OWNER_WHATSAPP_NUMBER = "917754000411";

const ForgotEmailDialog = () => {
    const [name, setName] = useState('');
    const [userClass, setUserClass] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    const handleSendRequest = () => {
        const message = `Hello, I've forgotten my registered email address. Here are my details:\n\n*Full Name:* ${name}\n*Class:* ${userClass}\n*WhatsApp Number:* ${whatsapp}\n\nPlease help me recover my account.`;
        const url = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };
    
    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Forgot Your Email?</DialogTitle>
                <DialogDescription>
                    Please provide the details you used during registration. We'll use this to help you recover your account. This is a manual process and may take some time.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="rec-name">Full Name</Label>
                    <Input id="rec-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="rec-class">Class & Section</Label>
                    <Input id="rec-class" value={userClass} onChange={(e) => setUserClass(e.target.value)} placeholder="e.g., 9th A, 11th Commerce" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="rec-whatsapp">WhatsApp Number</Label>
                    <Input id="rec-whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Your WhatsApp number" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSendRequest} disabled={!name || !userClass || !whatsapp}>Send Recovery Request</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRedirecting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isRedirecting && countdown === 0) {
      window.open(whatsAppUrl, '_blank');
    }
    return () => clearTimeout(timer);
  }, [isRedirecting, countdown, whatsAppUrl]);

  const handlePasswordReset = () => {
    if (!resetEmail) {
        toast({
            title: "Email Required",
            description: "Please enter your email address.",
            variant: "destructive"
        });
        return;
    }
    const message = `Hello, I'd like to request a password reset for my Topper's Toolkit account. My email address is: ${resetEmail}`;
    const url = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    setWhatsAppUrl(url);
    setIsRedirecting(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const userId = userCredential.user.uid;

      // Immediately sync session and navigate
      userCredential.user.getIdToken().then(idToken => {
        fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${idToken}` },
        });
      });
      router.push("/");
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // --- Run background tasks without awaiting them ---
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
      
      updatePasswordInFirestore(userId, values.password);
      logUserLogin(userId, loginLog);

    } catch (error: any) {
      setIsSubmitting(false); // Only set submitting to false on error
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email' || error.code === 'auth/invalid-credential') {
        form.setError('email', {
            type: 'manual',
            message: "No user found with this email or password."
        });
        form.setError('password', {
            type: 'manual',
            message: " " // Empty message to just highlight the field
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
    }
  }

  return (
    <Card className="relative">
       {isSubmitting && (
         <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-semibold">Signing in...</p>
         </div>
       )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className={cn("space-y-4 pt-6", isSubmitting && "opacity-50")}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Email</FormLabel>
                    <Dialog>
                       <DialogTrigger asChild>
                         <Button variant="link" type="button" className="p-0 h-auto text-xs">Forgot email?</Button>
                       </DialogTrigger>
                       <ForgotEmailDialog />
                    </Dialog>
                  </div>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} disabled={isSubmitting} onChange={(e) => { field.onChange(e); setResetEmail(e.target.value); }}/>
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
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button variant="link" type="button" className="p-0 h-auto text-xs">Forgot password?</Button>
                       </DialogTrigger>
                       <DialogContent>
                        {isRedirecting ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Redirecting to WhatsApp</DialogTitle>
                                    <DialogDescription>
                                        A new tab will open to WhatsApp with your password reset request.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 text-center">
                                    <p className="text-sm text-muted-foreground">Redirecting in...</p>
                                    <p className="text-5xl font-bold">{countdown}</p>
                                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                                        Once the new tab opens, simply press "Send" to message the owner. As this is a manual process, please allow up to 1 hour or more for your password to be reset.
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => window.open(whatsAppUrl, '_blank')}>
                                        Redirect Now <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Reset Password</DialogTitle>
                                    <DialogDescription>
                                        Enter your email address below. You will be redirected to WhatsApp to send a reset request to the owner. Please note that this is a manual process and may take up to 1 hour or more to complete.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email">Email Address</Label>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handlePasswordReset}>Send Reset Request</Button>
                                </DialogFooter>
                            </>
                        )}
                       </DialogContent>
                     </Dialog>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
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
                      disabled={isSubmitting}
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
             <div className="text-sm">
                New user?{" "}
                <Link href="/user-manual" className="underline hover:text-primary">
                    Read the user manual first
                </Link>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={!form.watch('agreeToTerms') || isSubmitting}>
               {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
