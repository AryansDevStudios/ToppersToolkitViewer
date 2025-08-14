
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, LogOut, Crown, UserCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

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


const ProfileMenu = () => {
    const { user, role } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        await fetch('/api/auth/session', { method: 'DELETE' });
        router.push('/login');
    };

    const getInitials = (name: string | null | undefined): string => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    if (!user) return (
        <NavItem href="/login" icon={LogIn} label="Login" isActive={false} />
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <div className={cn(
                    "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full cursor-pointer text-muted-foreground"
                )}>
                    <Avatar className={cn("h-7 w-7", role === 'Admin' && "ring-2 ring-orange-500", role === 'User' && "ring-2 ring-sky-500")}>
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3">
                     <Avatar className={cn(
                        "h-9 w-9",
                        role === 'Admin' && "ring-2 ring-offset-2 ring-orange-500 ring-offset-background",
                        role === 'User' && "ring-2 ring-offset-2 ring-sky-500 ring-offset-background"
                        )}>
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
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
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export function MobileBottomNav() {
    const pathname = usePathname();

    const navItems = [
      { href: "/", icon: Home, label: "Home" },
      { href: "/browse", icon: Search, label: "Browse" },
      { href: "https://topperstoolkit.netlify.app", icon: ShoppingBag, label: "Shop", external: true },
    ];


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
                <ProfileMenu />
            </div>
        </nav>
    );
}
