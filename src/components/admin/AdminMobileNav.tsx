
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Users, Library, Trophy, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/subjects", icon: Library, label: "Subjects" },
  { href: "/admin/notes", icon: FileText, label: "Notes" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/admin/qotd", icon: HelpCircle, label: "QoTD" },
];

export function AdminMobileNav() {
    const pathname = usePathname();

    // A simple way to check for the base path /admin and not its children
    const isDashboard = pathname === '/admin';

    return (
        <nav className="md:hidden p-2 sticky top-0 z-40 bg-background border-b">
            <div className="flex justify-center flex-wrap gap-1">
                {navItems.map((item) => {
                    // Dashboard needs exact match, others can be partial
                    const isActive = item.href === '/admin' 
                        ? isDashboard
                        : pathname.startsWith(item.href);

                    return (
                        <Link href={item.href} key={item.label}>
                            <div
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 rounded-md p-2 text-muted-foreground text-xs font-medium h-16 w-20 transition-colors",
                                    isActive ? "bg-primary/10 text-primary" : "hover:bg-accent"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}
