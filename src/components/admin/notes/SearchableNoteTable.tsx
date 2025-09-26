
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import type { User, Note } from "@/lib/types";

type NoteItem = (Note & { subjectName: string; subSubjectName: string; chapter: string; });

interface SearchableNoteTableProps {
  initialNotes: NoteItem[];
  users: User[];
}

export function SearchableNoteTable({ initialNotes, users }: SearchableNoteTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    const sortedNotes = initialNotes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (!searchQuery) {
      return sortedNotes;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedNotes.filter(note =>
      note.type.toLowerCase().includes(lowercasedQuery) ||
      note.chapter.toLowerCase().includes(lowercasedQuery) ||
      note.subSubjectName.toLowerCase().includes(lowercasedQuery) ||
      note.subjectName.toLowerCase().includes(lowercasedQuery)
    );
  }, [initialNotes, searchQuery]);

  return (
    <div className="space-y-4">
        <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
            />
        </div>
        <Card>
        <CardHeader>
            <CardTitle>All Notes</CardTitle>
            <CardDescription>
            A list of all notes currently on the platform.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Note Details</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Sub-Subject / Subject</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredNotes.map((note) => {
                const usersWithAccess = users.filter(user => user.noteAccess?.includes(note.id));
                return (
                    <TableRow key={note.id}>
                    <TableCell>
                        <div className="font-medium">{note.chapter}</div>
                        <div className="text-sm text-muted-foreground md:hidden mt-1 space-y-1">
                        <div>
                            <Badge variant="outline">{note.type}</Badge>
                        </div>
                        <div>{note.subSubjectName} / {note.subjectName}</div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{note.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div>{note.subSubjectName}</div>
                        <div className="text-xs text-muted-foreground">{note.subjectName}</div>
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
                            <a href={note.url || note.originalUrl || '#'} target="_blank" rel="noopener noreferrer">
                                View PDF
                            </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DeleteNoteDialog noteId={note.id} chapterId={note.chapterId} />
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                )
                })}
                {filteredNotes.length === 0 && (
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
