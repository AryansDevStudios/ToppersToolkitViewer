
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";
import { getUsers } from "@/lib/data";
import { JsonViewerDialog } from "@/components/admin/subjects/JsonViewerDialog";
import { SearchableUserGrid } from "@/components/admin/users/SearchableUserGrid";
import type { User } from "@/lib/types";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const allUsers: User[] = await getUsers();
  
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all user accounts.
          </p>
        </div>
        <JsonViewerDialog data={allUsers} title="All Users">
            <Button variant="outline">
                <FileJson className="mr-2 h-4 w-4" />
                View All as JSON
            </Button>
        </JsonViewerDialog>
      </header>
      <SearchableUserGrid initialUsers={allUsers} />
    </div>
  );
}
