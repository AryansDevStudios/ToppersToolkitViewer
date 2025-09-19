
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, Compass, Home, BookUser, History } from "lucide-react";
import { iconMap } from "@/lib/iconMap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "../ui/separator";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

const mainNavLinks = [
  { title: 'Home', icon: 'Home', href: '/' },
  { title: 'Browse', icon: 'Compass', href: '/browse' },
  { title: 'Leaderboard', icon: 'Swords', href: '/leaderboard' },
  { title: 'Puzzle & Quiz', icon: 'Puzzle', href: '/puzzle-quiz' },
  { title: 'Notices', icon: 'ClipboardList', href: '/notices' },
  { title: 'AI Help', icon: 'Bot', href: '/solve-doubts' },
  { title: 'Doubt Box', icon: 'MessageSquare', href: '/doubt-box' },
  { title: 'About Us', icon: 'Users', href: '/about-us' },
  { title: 'Telegram Chat', icon: 'Send', href: 'https://t.me/+BP99uVTapfw3YmY1', isExternal: true },
  { title: 'GS MCQs', icon: 'BookCheck', href: '/mcqs' },
  { title: 'Mindmap', icon: 'BrainCircuit', href: '/mindmap' },
];

const secondaryNavLinks = [
    { title: 'How to Use?', icon: 'BookUser', href: '/user-manual' },
    { title: 'Terms & Conditions', icon: 'Gavel', href: '/terms' },
    { title: 'Order History', icon: 'History', href: '/purchase-history' },
    { title: 'Invite Friends', icon: 'Gift', href: '/invite-friends' },
    { title: 'Inquiry', icon: 'HelpCircle', href: '/inquiry' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    setIsOpen(false);
    router.push('/login');
  };

  const renderNavLink = (link: any) => {
    const Icon = iconMap[link.icon] || Compass;
    const LinkComponent = link.isExternal ? 'a' : Link;
    
    return (
      <LinkComponent
        key={link.title}
        href={link.href}
        {...(link.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-4 p-3 rounded-md text-base font-medium hover:bg-accent"
      >
        <Icon className="h-5 w-5" />
        {link.title}
      </LinkComponent>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl">Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="py-4 px-6 space-y-4">
            <nav className="space-y-1">
              {mainNavLinks.map(renderNavLink)}
            </nav>
            <Separator />
            <nav className="space-y-1">
              {secondaryNavLinks.map(renderNavLink)}
            </nav>
            {user && (
              <>
                <Separator />
                <Button variant="ghost" className="w-full justify-start gap-4 p-3 text-base font-medium" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
