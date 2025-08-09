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
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { getUsers } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";


export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all user accounts.
          </p>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </header>
       <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Feature Disabled</AlertTitle>
        <AlertDescription>
          User management is disabled because the Firebase Admin SDK could not be initialized. User data cannot be fetched or modified.
        </AlertDescription>
      </Alert>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>SR. No.</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                User data is currently unavailable.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
