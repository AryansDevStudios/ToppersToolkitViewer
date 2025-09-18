
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Users,
  Library,
  Trophy,
  HelpCircle,
  ClipboardList,
  MessageSquare,
  BookCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/subjects", icon: Library, label: "Subjects" },
  { href: "/admin/notes", icon: FileText, label: "Notes" },
  { href: "/admin/mcqs", icon: BookCheck, label: "MCQs" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/admin/qotd", icon: HelpCircle, label: "QoTD" },
  { href: "/admin/notices", icon: ClipboardList, label: "Notices" },
  { href: "/admin/doubts", icon: MessageSquare, label: "Doubts" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <Separator />
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Button
                asChild
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
