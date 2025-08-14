
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user, role } = useAuth();

    const navItems = [
      { href: "/", icon: Home, label: "Home" },
      { href: "/browse", icon: Search, label: "Browse" },
      { href: "https://topperstoolkit.netlify.app", icon: ShoppingBag, label: "Shop", external: true },
    ];

    if (user && role === 'Admin') {
        navItems.push({ href: "/admin", icon: UserCog, label: "Admin", external: false });
    }

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
            <div className="container grid h-16 max-w-lg grid-cols-4 items-center">
                {navItems.map((item) => {
                    const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));
                    const LinkComponent = item.external ? 'a' : Link;
                    
                    return (
                        <LinkComponent
                            key={item.label}
                            href={item.href}
                            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 text-xs font-medium",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-6 w-6" />
                            <span>{item.label}</span>
                        </LinkComponent>
                    );
                })}
            </div>
        </nav>
    );
}
