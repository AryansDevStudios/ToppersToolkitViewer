
import { Button } from "@/components/ui/button";
import { FileJson, ShieldAlert } from "lucide-react";
import { getUsers } from "@/lib/data";
import { JsonViewerDialog } from "@/components/admin/subjects/JsonViewerDialog";
import { SearchableUserGrid } from "@/components/admin/users/SearchableUserGrid";
import type { User } from "@/lib/types";
import { SuspectsDialog } from "@/components/admin/users/SuspectsDialog";

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
        <div className="flex items-center gap-2">
            <SuspectsDialog users={allUsers} />
            <JsonViewerDialog data={allUsers} title="All Users">
                <Button variant="outline">
                    <FileJson className="mr-2 h-4 w-4" />
                    View All as JSON
                </Button>
            </JsonViewerDialog>
        </div>
      </header>
      <SearchableUserGrid initialUsers={allUsers} />
    </div>
  );
}
