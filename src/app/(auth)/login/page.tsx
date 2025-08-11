
"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const pathname = usePathname();

  return (
    <div className="w-full max-w-md">
      <Tabs value={pathname} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="/login" asChild>
            <Link href="/login">Login</Link>
          </TabsTrigger>
          <TabsTrigger value="/register" asChild>
            <Link href="/register">Register</Link>
          </TabsTrigger>
        </TabsList>
        {/* The content is rendered directly, not inside a TabsContent, to avoid content flash on navigation */}
      </Tabs>

      <Card className="mt-4">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
            <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
