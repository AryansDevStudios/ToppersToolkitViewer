
"use client";

import Link from "next/link";
import { LogOut, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserProfileMenuProps {
  isMobile?: boolean;
}

export function UserProfileMenu({ isMobile = false }: UserProfileMenuProps) {
  const { user, dbUser, role, loading } = useAuth();
  const router = useRouter();

  if (loading || !user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(Boolean); // Handle extra spaces
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };
  
  const triggerClasses = isMobile
    ? "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full cursor-pointer text-muted-foreground"
    : "relative h-9 w-9 rounded-full";

  const avatarClasses = isMobile ? "h-7 w-7" : "h-9 w-9";
  
  const ringClasses = cn("ring-2", {
    "ring-orange-500": role === 'Admin',
    "ring-green-500": role !== 'Admin' && dbUser?.hasFullNotesAccess,
    "ring-sky-500": role !== 'Admin' && !dbUser?.hasFullNotesAccess,
    "ring-border": !dbUser // Default ring while dbUser is loading
  });
  
  const mobileRingClasses = isMobile ? ringClasses : `${ringClasses} ring-offset-2 ring-offset-background`;


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={isMobile ? 'flex-1' : ''}>
         {isMobile ? (
            <div className={triggerClasses}>
                <Avatar className={cn(avatarClasses, ringClasses)}>
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <span>Profile</span>
            </div>
         ) : (
            <Button variant="ghost" className={triggerClasses}>
                <Avatar className={cn(avatarClasses, mobileRingClasses)}>
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
            </Button>
         )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {role === 'Admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <UserCog className="mr-2 h-4 w-4" />
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
  );
}
