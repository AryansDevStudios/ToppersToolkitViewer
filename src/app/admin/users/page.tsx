
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
import { UserForm } from "@/components/admin/users/UserForm";
import { LoginHistoryDialog } from "@/components/admin/users/LoginHistoryDialog";
import { ManageAccessDialog } from "@/components/admin/users/ManageAccessDialog";

export const revalidate = 0;

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                     <div className="font-medium">{user.name || 'N/A'}</div>
                     <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <UserForm user={user} />
                        <ManageAccessDialog user={user} />
                        {user.loginLogs && user.loginLogs.length > 0 && <LoginHistoryDialog user={user} />}
                        <DropdownMenuSeparator />
                        <ChangeRoleMenuItem userId={user.id} currentRole={user.role} />
                        <DeleteUserDialog userId={user.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
