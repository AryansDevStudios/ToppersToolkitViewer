
"use client";

import Link from "next/link";
import { LogIn, Sun, Moon, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { UserProfileMenu } from "./UserProfileMenu";

function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function AppHeader() {
  const { user, role, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="https://raw.githubusercontent.com/AryansDevStudios/ToppersToolkit/main/icon/icon_app_128x128.png" alt="Topper's Toolkit Library Logo" width={32} height={32} className="rounded-md" />
          <span className="font-bold inline-block text-base sm:text-lg">
            Topper's Toolkit Library
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/browse">Browse Notes</Link>
          </Button>
          <Button variant="ghost" asChild>
            <a href="https://topperstoolkit.netlify.app" target="_blank" rel="noopener noreferrer">Shop</a>
          </Button>
          {mounted && user && role === 'Admin' && (
            <Button variant="ghost" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          )}
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Render a placeholder on the server and initial client render */}
          {!mounted ? (
            <div className="h-10 w-10" />
          ) : (
            <ThemeToggle />
          )}

          <div className="hidden md:block">
            {/* Defer rendering of auth-dependent UI until mounted */}
            {!mounted || loading ? (
              <Skeleton className="h-10 w-24 rounded-md" />
            ) : user ? (
              <UserProfileMenu />
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>
          
           {/* Mobile Admin button */}
           {mounted && user && role === 'Admin' && (
             <Button variant="ghost" size="icon" asChild className="md:hidden">
               <Link href="/admin">
                 <UserCog className="h-5 w-5" />
                 <span className="sr-only">Admin</span>
               </Link>
             </Button>
           )}
        </div>
      </div>
    </header>
  );
}
