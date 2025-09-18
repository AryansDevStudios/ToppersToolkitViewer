
"use client";

import Link from "next/link";
import { LogIn, Sun, Moon } from "lucide-react";
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
import { GlobalSearch } from "./GlobalSearch";
import { SidebarNav } from "./SidebarNav";

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
         <div className="flex items-center">
            <SidebarNav />
            <Link href="/" className="flex items-center space-x-2 ml-2">
                <Image src="https://topperstoolkit.netlify.app/icon/icon_main.png" alt="Topper's Toolkit Logo" width={32} height={32} />
                <span className="font-bold hidden sm:inline-block text-base sm:text-lg">
                Topper's Toolkit
                </span>
            </Link>
        </div>
        
        <div className="flex-1 flex justify-start items-center md:justify-center px-4">
            <div className="w-full max-w-sm">
                <GlobalSearch />
            </div>
        </div>
        
        <div className="flex flex-none items-center justify-end">
           {mounted && user && role === 'Admin' && (
              <Button variant="ghost" asChild className="hidden md:flex">
                  <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
         
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <div className="pl-2">
            {loading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
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
        </div>
      </div>
    </header>
  );
}
