
"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { KeyRound, Loader2, Library, Folder, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAllNotes, updateUserNoteAccess } from "@/lib/data";
import type { User, Note } from "@/lib/types";

type NoteItem = Note & { subject: string; chapter: string; };

interface ManageAccessDialogProps {
  user: User;
}

const groupNotes = (notes: NoteItem[]) => {
    const grouped: { [subject: string]: { [chapter: string]: NoteItem[] } } = {};
    notes.forEach(note => {
        if (!grouped[note.subject]) {
            grouped[note.subject] = {};
        }
        if (!grouped[note.subject][note.chapter]) {
            grouped[note.subject][note.chapter] = [];
        }
        grouped[note.subject][note.chapter].push(note);
    });
    return grouped;
};

export function ManageAccessDialog({ user }: ManageAccessDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [access, setAccess] = useState<Set<string>>(new Set(user.noteAccess || []));
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getAllNotes()
                .then(fetchedNotes => {
                    setNotes(fetchedNotes.sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0)));
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch notes for access management:", err);
                    toast({ title: "Error", description: "Could not load notes.", variant: "destructive" });
                    setIsLoading(false);
                });
        }
    }, [isOpen, toast]);

    const handleAccessChange = (noteId: string, newAccess: boolean) => {
        startTransition(async () => {
             const result = await updateUserNoteAccess(user.id, noteId, newAccess);
             if (result.success) {
                setAccess(prev => {
                    const newSet = new Set(prev);
                    if (newAccess) newSet.add(noteId);
                    else newSet.delete(noteId);
                    return newSet;
                });
                toast({
                    title: "Access Updated",
                    description: `Permission for note has been ${newAccess ? 'granted' : 'revoked'}.`,
                });
             } else {
                 toast({
                    title: "Update Failed",
                    description: result.error || "Could not update note access.",
                    variant: "destructive",
                 });
             }
        });
    };

    const groupedNotes = groupNotes(notes);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Manage Access
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Manage Note Access for {user.name}</DialogTitle>
                    <DialogDescription>
                        Grant or revoke access to specific notes for this user.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-6 border rounded-md">
                   <div className="p-4">
                     {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                     ) : (
                        <Accordion type="multiple" className="w-full">
                           {Object.entries(groupedNotes).map(([subject, chapters]) => (
                             <AccordionItem value={subject} key={subject}>
                               <AccordionTrigger className="text-lg font-semibold">
                                 <div className="flex items-center gap-2">
                                   <Library className="h-5 w-5 text-primary" />
                                   {subject}
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent className="pl-4">
                                 <Accordion type="multiple" className="w-full">
                                    {Object.entries(chapters).map(([chapter, notesInChapter]) => (
                                      <AccordionItem value={chapter} key={chapter}>
                                        <AccordionTrigger>
                                           <div className="flex items-center gap-2">
                                             <Folder className="h-5 w-5 text-primary/80" />
                                             {chapter}
                                           </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-6">
                                          <ul className="space-y-3 py-2">
                                            {notesInChapter.map(note => (
                                               <li key={note.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                                 <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <Label htmlFor={`access-${note.id}`} className="font-normal">{note.type}</Label>
                                                 </div>
                                                 <Switch
                                                   id={`access-${note.id}`}
                                                   checked={access.has(note.id)}
                                                   onCheckedChange={(checked) => handleAccessChange(note.id, checked)}
                                                   disabled={isPending}
                                                 />
                                               </li>
                                            ))}
                                          </ul>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                 </Accordion>
                               </AccordionContent>
                             </AccordionItem>
                           ))}
                        </Accordion>
                     )}
                   </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
