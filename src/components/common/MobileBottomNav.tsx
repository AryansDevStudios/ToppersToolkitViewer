
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Newspaper, LogIn, Sparkles, BookCheck, Puzzle, Search, Clock, ShieldAlert } from "lucide-react";
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

function DemoTimerMobile() {
    const { dbUser } = useAuth(null);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        if (!dbUser?.demoExpiresAt || dbUser.hasFullNotesAccess) {
            setTimeLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const expiration = dbUser.demoExpiresAt!;
            const remaining = expiration - now;

            if (remaining <= 0) {
                setTimeLeft("Expired");
                clearInterval(interval);
            } else {
                const minutes = Math.floor((remaining / 1000) / 60);
                const seconds = Math.floor((remaining / 1000) % 60);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [dbUser]);

    if (!timeLeft) {
        return null;
    }

    if (timeLeft === "Expired") {
        return (
            <Link href="/pricing" className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-medium bg-destructive text-destructive-foreground px-2 py-1 rounded-full shadow-md">
                <ShieldAlert className="h-3 w-3" />
                <span>Demo Expired</span>
            </Link>
        )
    }

    return (
        <Link href="/pricing" className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-medium bg-destructive text-destructive-foreground px-2 py-1 rounded-full shadow-md">
            <Clock className="h-3 w-3" />
            <span>Demo: {timeLeft}</span>
        </Link>
    );
}

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const isDoubtSolverPage = pathname === '/solve-doubts';

    if (isDoubtSolverPage) {
        return null;
    }
    
    const navItems = [
      { href: "/", icon: Home, label: "Home" },
      { href: "/browse", icon: Compass, label: "Notes" },
      { href: "/solve-doubts", icon: Sparkles, label: "AI Help", iconClassName: "text-orange-500" },
      { href: "/current-affairs", icon: Newspaper, label: "Affairs" },
      { href: "/puzzle-quiz", icon: Puzzle, label: "Quiz" },
    ];
    
    return (
        <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
            <DemoTimerMobile />
            <div className="container grid h-16 max-w-lg items-center p-0 grid-cols-5">
                {navItems.map((item) => {
                    const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                       <NavItem 
                         key={item.label}
                         href={item.href}
                         icon={item.icon}
                         label={item.label}
                         isActive={isActive}
                         iconClassName={item.iconClassName}
                       />
                    );
                })}
            </div>
        </nav>
    );
}
