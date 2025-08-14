
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== 'Admin') {
    return (
       <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You don't have permission to view this page.</p>
          <Button asChild className="mt-6">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
    );
  }
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col bg-muted/40">
        <AdminMobileNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
