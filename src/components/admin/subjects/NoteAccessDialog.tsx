
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Users, UserCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User, Note } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NoteAccessDialogProps {
  note: Note;
  users: User[];
  isDropdownItem?: boolean;
}

const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
};

export function NoteAccessDialog({ note, users, isDropdownItem = true }: NoteAccessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const Trigger = isDropdownItem ? (
    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsOpen(true); }}>
        View Access
    </DropdownMenuItem>
  ) : (
     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(true)}>
        <Users className="h-4 w-4" />
        <span className="sr-only">View Access</span>
      </Button>
  );


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {Trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Who has access to this note?</DialogTitle>
          <DialogDescription>
            A list of users who can view the note: <strong>{note.type}</strong>.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[40vh] pr-6">
            {users.length > 0 ? (
                <ul className="space-y-3">
                    {users.map((user) => (
                        <li key={user.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <UserCircle className="h-12 w-12 mb-4" />
                    <p className="font-semibold">No users have access to this note yet.</p>
                </div>
            )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
