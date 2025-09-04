
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, LogIn, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserProfileMenu } from "./UserProfileMenu";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

const NavItem = ({ href, icon: Icon, label, isActive, isExternal, className, iconClassName }: { href: string, icon: React.ElementType, label: string, isActive: boolean, isExternal?: boolean, className?: string, iconClassName?: string }) => {
    const LinkComponent = isExternal ? 'a' : Link;
    return (
        <LinkComponent
            href={href}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground",
                className
            )}
        >
            <Icon className={cn("h-6 w-6", iconClassName)} />
            <span>{label}</span>
        </LinkComponent>
    )
};

const MobileNavSkeleton = () => (
    <div className="container grid h-16 max-w-lg items-center p-0 grid-cols-5">
        {[...Array(5)].map((_, i) => (
             <div key={i} className="flex flex-col items-center justify-center gap-1 w-full h-full">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-2 w-10 rounded-sm" />
            </div>
        ))}
    </div>
);


export function MobileBottomNav() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDoubtSolverPage = pathname === '/solve-doubts';

    if (isDoubtSolverPage) {
        return null;
    }

    if (!mounted) {
        return (
            <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
                <MobileNavSkeleton />
            </nav>
        );
    }
    
    const navItems = [
      { href: "/", icon: Home, label: "Home" },
      { href: "/browse", icon: Search, label: "Browse" },
      { href: "/solve-doubts", icon: Sparkles, label: "AI Help", iconClassName: "text-orange-400" },
      { href: "https://topperstoolkit.netlify.app", icon: ShoppingBag, label: "Shop", isExternal: false },
    ];

    const renderAuthSlot = () => {
      if (loading) {
         return (
            <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-2 w-10 rounded-sm" />
            </div>
        )
      }
      if (user) {
        return <UserProfileMenu isMobile={true} />;
      } else {
        return (
          <Link href="/login" className="flex items-center justify-center w-full h-full p-1">
             <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full bg-primary text-primary-foreground rounded-md">
                 <LogIn className="h-6 w-6" />
                 <span>Login</span>
             </div>
          </Link>
        )
      }
    };
    
    const gridColsClass = 'grid-cols-5';

    return (
        <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
            <div className={cn("container grid h-16 max-w-lg items-center p-0", gridColsClass)}>
                {navItems.map((item) => {
                    const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                       <NavItem 
                         key={item.label}
                         href={item.href}
                         icon={item.icon}
                         label={item.label}
                         isActive={isActive}
                         isExternal={item.isExternal}
                         iconClassName={item.iconClassName}
                       />
                    );
                })}
                {renderAuthSlot()}
            </div>
        </nav>
    );
}