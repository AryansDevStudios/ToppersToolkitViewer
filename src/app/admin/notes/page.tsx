
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
import { getAllNotes, getUsers } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { DeleteNoteDialog } from "@/components/admin/DeleteNoteDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NoteAccessDialog } from "@/components/admin/subjects/NoteAccessDialog";
import type { User } from "@/lib/types";

export const revalidate = 0;

export default async function AdminNotesPage() {
  const allNotes = await getAllNotes();
  const notes = allNotes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const users: User[] = await getUsers();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
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
      <Card>
        <CardHeader>
           <CardTitle>All Notes</CardTitle>
           <CardDescription>A list of all notes currently on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Note Details</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Subject / Sub-Subject</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => {
                 const usersWithAccess = users.filter(user => user.noteAccess?.includes(note.id));
                 return (
                    <TableRow key={note.id}>
                      <TableCell>
                        <div className="font-medium">{note.chapter}</div>
                        <div className="text-sm text-muted-foreground md:hidden mt-1 space-y-1">
                          <div>
                            <Badge variant="outline">{note.type}</Badge>
                          </div>
                          <div>{note.subjectName} / {note.subSubjectName}</div>
                        </div>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{note.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>{note.subjectName}</div>
                        <div className="text-xs text-muted-foreground">{note.subSubjectName}</div>
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
                             <DropdownMenuItem asChild>
                               <Link href={`/admin/notes/edit/${note.id}`}>Edit</Link>
                             </DropdownMenuItem>
                            <NoteAccessDialog note={note} users={usersWithAccess} />
                            <DropdownMenuItem asChild>
                              <Link href={note.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  View PDF
                              </Link>
                            </DropdownMenuItem>
                             <DropdownMenuSeparator />
                            <DeleteNoteDialog noteId={note.id} chapterId={note.chapterId} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                 )
                })}
               {notes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No notes found.
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
