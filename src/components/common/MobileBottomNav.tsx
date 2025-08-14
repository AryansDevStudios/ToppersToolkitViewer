
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserProfileMenu } from "./UserProfileMenu";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

const NavItem = ({ href, icon: Icon, label, isActive, isExternal }: { href: string, icon: React.ElementType, label: string, isActive: boolean, isExternal?: boolean }) => {
    const LinkComponent = isExternal ? 'a' : Link;
    return (
        <LinkComponent
            href={href}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground"
            )}
        >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
        </LinkComponent>
    )
};

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
      { href: "/", icon: Home, label: "Home" },
      { href: "/browse", icon: Search, label: "Browse" },
      { href: "https://topperstoolkit.netlify.app", icon: ShoppingBag, label: "Shop", external: true },
    ];
    
    const renderAuthSlot = () => {
      // Before component is mounted, render a static placeholder to prevent hydration mismatch
      if (!mounted) {
        return (
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-2 w-10 rounded-sm" />
          </div>
        );
      }
      
      // After mounting, show the correct UI based on auth state
      if (user) {
        return <UserProfileMenu isMobile={true} />;
      } else {
        return <NavItem href="/login" icon={LogIn} label="Login" isActive={pathname === '/login'} />;
      }
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
            <div className="container grid h-16 max-w-lg grid-cols-4 items-center p-0">
                {navItems.map((item) => {
                    const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                       <NavItem 
                         key={item.label}
                         href={item.href}
                         icon={item.icon}
                         label={item.label}
                         isActive={isActive}
                         isExternal={item.external}
                       />
                    );
                })}
                {renderAuthSlot()}
            </div>
        </nav>
    );
}

