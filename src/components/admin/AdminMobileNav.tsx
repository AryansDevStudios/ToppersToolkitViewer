
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Users, Library, Trophy, HelpCircle, ClipboardList, MessageSquare, BookCheck, Printer, Settings, Menu, LogOut, Star, CheckCircle, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";


const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/subjects", icon: Library, label: "Subjects" },
  { href: "/admin/notes", icon: FileText, label: "Notes" },
  { href: "/admin/mcqs", icon: BookCheck, label: "MCQs" },
  { href: "/admin/current-affairs", icon: Newspaper, label: "Current Affairs" },
  { href: "/admin/subscriptions", icon: Star, label: "Subscription Requests" },
  { href: "/admin/active-subscriptions", icon: CheckCircle, label: "Active Subscriptions" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/admin/qotd", icon: HelpCircle, label: "QoTD" },
  { href: "/admin/notices", icon: ClipboardList, label: "Notices" },
  { href: "/admin/doubts", icon: MessageSquare, label: "Doubts" },
  { href: "/admin/complaints", icon: FileText, label: "Complaints" },
  { href: "/admin/orders", icon: Printer, label: "Print Orders"},
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminMobileNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="md:hidden flex items-center h-16 px-4 border-b bg-background">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open Admin Menu</span>
                    </Button>
                </SheetTrigger>
                 <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm p-0">
                    <SheetHeader className="p-6 pb-2">
                        <SheetTitle className="text-2xl">Admin Menu</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100%-4rem)]">
                        <div className="py-4 px-6">
                            <ul className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = (item.href === '/admin' && pathname === '/admin') || (item.href !== '/admin' && pathname.startsWith(item.href));
                                return (
                                <li key={item.label}>
                                <Button
                                    asChild
                                    variant={isActive ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                    </Link>
                                </Button>
                                </li>
                            )})}
                            </ul>
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
             <div className="flex-1 text-center">
                <h2 className="font-semibold text-lg">Admin Panel</h2>
            </div>
            <div className="w-10"></div>
        </nav>
    );
}
