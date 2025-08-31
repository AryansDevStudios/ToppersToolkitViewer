
"use client";

import Link from "next/link";
import { LogIn, Sun, Moon, UserCog, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { UserProfileMenu } from "./UserProfileMenu";

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
          <Image src="https://topperstoolkit.netlify.app/icon/icon_main.png" alt="Topper's Toolkit Library Logo" width={32} height={32} />
          <span className="font-bold inline-block text-base sm:text-lg">
            Topper's Toolkit Library
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/browse">Browse Notes</Link>
          </Button>
           <Button variant="ghost" asChild>
            <Link href="/solve-doubts" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-400" />
              AI Help
            </Link>
          </Button>
           <Button variant="ghost" asChild>
            <Link href="/our-teachers">Our Teachers</Link>
          </Button>
          <Button variant="ghost" asChild>
            <a href="https://topperstoolkit.netlify.app">Shop</a>
          </Button>
        </nav>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
           {mounted && user && role === 'Admin' && (
              <Button variant="ghost" asChild className="hidden md:flex">
                  <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
         
          <ThemeToggle />

          <div className="hidden md:block">
            {loading ? (
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
