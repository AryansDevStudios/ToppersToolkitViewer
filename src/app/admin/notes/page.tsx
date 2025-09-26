
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getAllNotes, getUsers } from "@/lib/data";
import Link from "next/link";
import { SearchableNoteTable } from "@/components/admin/notes/SearchableNoteTable";
import type { User } from "@/lib/types";

export const revalidate = 0;

export default async function AdminNotesPage() {
  const allNotes = await getAllNotes();
  const users: User[] = await getUsers();

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes Management</h1>
          <p className="text-muted-foreground">
            Manage all notes and documents on the platform.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/notes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Note
          </Link>
        </Button>
      </header>
      <SearchableNoteTable initialNotes={allNotes} users={users} />
    </div>
  );
}
