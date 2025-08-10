
"use client";

import Link from "next/link";
import { UserCircle, LogIn, Crown, LogOut, Sun, Moon, Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    // After signing out with client-side auth, we need to clear the server-side session cookie.
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
  };

  const closeSheet = () => setIsSheetOpen(false);

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <>
      <Button variant="ghost" asChild>
        <Link href="/" onClick={inSheet ? closeSheet : undefined}>Home</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/browse" onClick={inSheet ? closeSheet : undefined}>Browse Notes</Link>
      </Button>
       <Button variant="ghost" asChild>
        <a href="https://topperstoolkit.netlify.app">Shop</a>
      </Button>
       {mounted && user && role === 'Admin' && (
        <Button variant="ghost" asChild>
          <Link href="/admin" onClick={inSheet ? closeSheet : undefined}>Admin</Link>
        </Button>
      )}
    </>
  );
  
  const renderThemeToggle = () => {
    if (!mounted) {
      return <div className="h-10 w-10" />;
    }
    return <ThemeToggle />;
  }

  const renderAuthSection = () => {
    if (!mounted || loading) {
       return <Skeleton className="h-9 w-9 rounded-full" />;
    }
    
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
               <Avatar className={cn("h-9 w-9", role === 'Admin' && "ring-2 ring-offset-2 ring-orange-500 ring-offset-background")}>
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {role === 'Admin' && (
                <DropdownMenuItem asChild>
                <Link href="/admin">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                </Link>
                </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    } else {
        return (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
        )
    }
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="https://raw.githubusercontent.com/AryansDevStudios/ToppersToolkit/main/icon/icon_app_128x128.png" alt="Topper's Toolkit Viewer Logo" width={32} height={32} className="rounded-md" />
          <span className="font-bold inline-block font-headline text-lg">
            Topper's Toolkit Viewer
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-end space-x-2">
          <NavLinks />
          {renderThemeToggle()}
          {renderAuthSection()}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden flex-1 justify-end items-center">
          {renderThemeToggle()}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
               <SheetHeader>
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                </SheetHeader>
              <nav className="flex flex-col items-start space-y-4 pt-8">
                <NavLinks inSheet={true} />
                <div className="pt-4 border-t w-full">
                   {!mounted || loading ? (
                     <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                     </div>
                  ) : user ? (
                     <div className="space-y-4">
                        <div className="font-medium">
                            <p>{user.displayName || "User"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Button onClick={() => { handleLogout(); closeSheet();}} className="w-full">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                     </div>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href="/login" onClick={closeSheet}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
