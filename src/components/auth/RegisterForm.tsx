
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, db, createUserWithEmailAndPassword, updateProfile, doc, setDoc, signInWithEmailAndPassword } from "@/lib/firebase";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { logUserLogin } from "@/lib/data";
import type { LoginLog } from "@/lib/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Full Name is required." }),
  role: z.enum(["Student", "Teacher"], { required_error: "You must select a role."}),
  class: z.string().optional(),
  section: z.string().optional(),
  gender: z.string().optional(),
  srNo: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email."}),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  whatsappNumber: z.string().min(1, { message: "WhatsApp Number is required." }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
}).refine(data => {
    if (data.role === 'Student') {
        return !!data.class && !!data.section;
    }
    return true;
}, {
    message: "Class and Section are required for students.",
    path: ['section'], // show error on section field
}).refine(data => {
    if (data.role === 'Teacher') {
        return !!data.gender;
    }
    return true;
}, {
    message: "Gender is required for teachers.",
    path: ['gender'],
}).refine(data => {
    if (data.role === 'Student') {
        return !!data.srNo && /^\d{4}$/.test(data.srNo);
    }
    return true;
}, {
    message: "SR. No. must be exactly 4 digits.",
    path: ['srNo']
});

// Helper to get ordinal suffix
const getOrdinalSuffix = (n: number) => {
  if (n % 100 >= 11 && n % 100 <= 13) {
    return 'th';
  }
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};


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

export function RegisterForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "Student",
      srNo: "",
      email: "",
      password: "",
      whatsappNumber: "",
      agreeToTerms: false,
    },
  });
  
  const role = form.watch("role");
  const studentClass = form.watch("class");

  const getSectionOptions = () => {
      if (!studentClass) return [];
      const classNum = parseInt(studentClass);
      if (classNum === 11 || classNum === 12) {
          return ["Biology", "Maths", "Commerce"];
      }
      return ["A", "B", "C"];
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { email, password, role } = values;
      const name = values.name.trim();
      const whatsappNumber = values.whatsappNumber.trim();
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      let classAndSection = undefined;
      if (role === 'Student' && values.class && values.section) {
          const classNum = parseInt(values.class);
          classAndSection = `${classNum}${getOrdinalSuffix(classNum)} ${values.section}`;
      }

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name,
        email,
        password, 
        classAndSection,
        gender: role === 'Teacher' ? values.gender : undefined,
        srNo: role === 'Student' ? values.srNo?.trim() : undefined,
        whatsappNumber,
        role: role,
        createdAt: Date.now(),
        hasAiAccess: true, // Grant AI access to new users by default
      });
      
      // Auto-login user
      await signInWithEmailAndPassword(auth, email, password);
      
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

      toast({
        title: "Registration Successful",
        description: "Welcome! Redirecting you now...",
      });
      router.push("/");
    } catch (error: any) {
       if (error.code === 'auth/email-already-in-use') {
        form.setError('email', {
          type: 'manual',
          message: 'This email address is already registered.'
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Aryan Gupta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Register as</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Student" />
                        </FormControl>
                        <FormLabel className="font-normal">Student</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Teacher" />
                        </FormControl>
                        <FormLabel className="font-normal">Teacher</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {role === 'Student' && (
                <>
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
                                                <SelectItem key={num} value={String(num)}>{num}{getOrdinalSuffix(num)}</SelectItem>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!studentClass}>
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
                </>
            )}
            
            {role === 'Teacher' && (
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
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Create Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="•••••••••" {...field} />
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
            <div className="text-sm">
                New user?{" "}
                <Link href="/user-manual" className="underline hover:text-primary">
                    Read the user manual first
                </Link>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={!form.watch('agreeToTerms') || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
