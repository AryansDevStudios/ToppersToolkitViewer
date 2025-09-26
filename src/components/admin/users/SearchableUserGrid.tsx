
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, KeyRound, Edit, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { ChangeRoleMenuItem } from "@/components/admin/ChangeRoleMenuItem";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { LoginHistoryDialog } from "@/components/admin/users/LoginHistoryDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(Boolean); // Handle extra spaces
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
};

const UserAvatar = ({ user }: { user: User }) => {
  const ringClasses = cn("ring-2 ring-offset-2 ring-offset-background", {
    "ring-orange-500": user.role === 'Admin',
    "ring-green-500": user.role !== 'Admin' && user.hasFullNotesAccess,
    "ring-sky-500": user.role !== 'Admin' && !user.hasFullNotesAccess,
  });

  return (
    <Avatar className={ringClasses}>
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
};

const UserActions = ({ user }: { user: User }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/info/${user.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Info
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link href={`/admin/users/access/${user.id}`}>
                <KeyRound className="mr-2 h-4 w-4" />
                Manage Access
               </Link>
            </DropdownMenuItem>
            {user.loginLogs && user.loginLogs.length > 0 && <LoginHistoryDialog user={user} />}
            <DropdownMenuSeparator />
            <ChangeRoleMenuItem userId={user.id} currentRole={user.role} />
            <DeleteUserDialog userId={user.id} />
        </DropdownMenuContent>
    </DropdownMenu>
);


interface SearchableUserGridProps {
    initialUsers: User[];
}

export function SearchableUserGrid({ initialUsers }: SearchableUserGridProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = useMemo(() => {
        const sortedUsers = initialUsers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (!searchQuery) {
            return sortedUsers;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        return sortedUsers.filter(user =>
            (user.name && user.name.toLowerCase().includes(lowercasedQuery)) ||
            (user.email && user.email.toLowerCase().includes(lowercasedQuery)) ||
            (user.classAndSection && user.classAndSection.toLowerCase().includes(lowercasedQuery)) ||
            (user.srNo && user.srNo.includes(lowercasedQuery)) ||
            (user.whatsappNumber && user.whatsappNumber.includes(lowercasedQuery))
        );
    }, [initialUsers, searchQuery]);

    return (
        <div className="space-y-4">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all registered users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredUsers.map((user) => (
                                <Card key={user.id} className="flex flex-col">
                                    <CardContent className="pt-6 flex-1 flex flex-col items-center text-center">
                                        <UserAvatar user={user} />
                                        <h3 className="mt-4 font-semibold text-lg">{user.name || 'N/A'}</h3>
                                        <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                                    </CardContent>
                                    <div className="flex items-center justify-center p-4 border-t bg-muted/50">
                                        <UserActions user={user} />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                            <h2 className="text-2xl font-bold mb-2">No Users Found</h2>
                            <p>No users match your current search query.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
