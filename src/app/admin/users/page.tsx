
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, KeyRound, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUsers } from "@/lib/data";
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

export const revalidate = 0;

const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
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

export default async function AdminUsersPage() {
  const allUsers = await getUsers();
  const users = allUsers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all user accounts.
          </p>
        </div>
      </header>
      <Card>
         <CardHeader>
           <CardTitle>All Users</CardTitle>
           <CardDescription>A list of all registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile and Tablet View: List of Cards */}
          <div className="space-y-4 md:hidden">
            {users.length > 0 ? users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <UserAvatar user={user} />
                  <div className="space-y-1">
                      <p className="font-medium">{user.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <UserActions user={user} />
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-12">No users found.</p>
            )}
          </div>
          
          {/* Desktop View: Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                         <UserAvatar user={user} />
                         <div>
                           <div className="font-medium">{user.name || 'N/A'}</div>
                           <div className="text-sm text-muted-foreground">{user.email}</div>
                         </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <UserActions user={user} />
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
