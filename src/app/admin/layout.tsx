
"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, FileText, LayoutDashboard, Users, Loader2, ShieldAlert, Library } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/subjects", icon: Library, label: "Subjects" },
  { href: "/admin/notes", icon: FileText, label: "Notes" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, loading } = useAuth();

  const closeSheet = () => setIsSheetOpen(false);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || role !== 'Admin') {
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
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Image src="https://raw.githubusercontent.com/AryansDevStudios/ToppersToolkit/main/icon/icon_app_128x128.png" alt="Topper's Toolkit Viewer Logo" width={24} height={24} />
            <span className="sr-only">Topper's Toolkit Viewer</span>
          </Link>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <nav className="grid gap-4 text-lg font-medium mt-8">
                 <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Image src="https://raw.githubusercontent.com/AryansDevStudios/ToppersToolkit/main/icon/icon_app_128x128.png" alt="Topper's Toolkit Viewer Logo" width={24} height={24} />
                    <span className="font-headline">Admin Panel</span>
                </Link>
                {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeSheet}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === item.href && "bg-muted text-primary"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
               </nav>
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
