

"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
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
import { getAllNotes, updateUserAccessBatch } from "@/lib/data";
import type { User, Note } from "@/lib/types";

type NoteItem = Note & { subjectName: string; subSubjectName: string; chapter: string; };

interface ManageAccessDialogProps {
  user: User;
}

const groupNotes = (notes: NoteItem[]) => {
    const grouped: { 
        [subject: string]: { 
            [subSubject: string]: {
                 [chapter: string]: NoteItem[] 
            } 
        } 
    } = {};

    notes.forEach(note => {
        if (!grouped[note.subjectName]) {
            grouped[note.subjectName] = {};
        }
        if (!grouped[note.subjectName][note.subSubjectName]) {
            grouped[note.subjectName][note.subSubjectName] = {};
        }
        if (!grouped[note.subjectName][note.subSubjectName][note.chapter]) {
            grouped[note.subjectName][note.subSubjectName][note.chapter] = [];
        }
        grouped[note.subjectName][note.subSubjectName][note.chapter].push(note);
    });
    return grouped;
};

export function ManageAccessDialog({ user }: ManageAccessDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [access, setAccess] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const initialAccess = useMemo(() => new Set(user.noteAccess || []), [user.noteAccess]);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setAccess(new Set(user.noteAccess || []));
            getAllNotes()
                .then(fetchedNotes => {
                    const sortedNotes = fetchedNotes.sort((a, b) => {
                        if (a.subjectName < b.subjectName) return -1;
                        if (a.subjectName > b.subjectName) return 1;
                        if (a.subSubjectName < b.subSubjectName) return -1;
                        if (a.subSubjectName > b.subSubjectName) return 1;
                        if (a.chapter < b.chapter) return -1;
                        if (a.chapter > b.chapter) return 1;
                        return (a.createdAt || 0) - (b.createdAt || 0);
                    });
                    setNotes(sortedNotes);
                    setIsLoading(false);
                })
                .catch(err => {
                    toast({ title: "Error", description: "Could not load notes.", variant: "destructive" });
                    setIsLoading(false);
                });
        }
    }, [isOpen, user.noteAccess, toast]);

    const handleAccessChange = (noteId: string, newAccess: boolean) => {
        setAccess(prev => {
            const newSet = new Set(prev);
            if (newAccess) newSet.add(noteId);
            else newSet.delete(noteId);
            return newSet;
        });
    };
    
    const handleSave = () => {
        startTransition(async () => {
            const accessArray = Array.from(access);
            const result = await updateUserAccessBatch(user.id, accessArray);
            if (result.success) {
                toast({
                    title: "Access Updated",
                    description: "User permissions have been saved successfully.",
                });
                setIsOpen(false);
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
    
    const haveChanges = useMemo(() => {
        if (initialAccess.size !== access.size) return true;
        for (const id of initialAccess) {
            if (!access.has(id)) return true;
        }
        return false;
    }, [initialAccess, access]);

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
                        Grant or revoke access to specific notes. Click "Save Changes" when you're done.
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
                           {Object.entries(groupedNotes).map(([subject, subSubjects]) => (
                             <AccordionItem value={subject} key={subject}>
                               <AccordionTrigger className="text-lg font-semibold">
                                 <div className="flex items-center gap-2">
                                   <Library className="h-5 w-5 text-primary" />
                                   {subject}
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent className="pl-4">
                                 <Accordion type="multiple" className="w-full">
                                    {Object.entries(subSubjects).map(([subSubject, chapters]) => (
                                       <AccordionItem value={subSubject} key={subSubject}>
                                            <AccordionTrigger className="text-md font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Folder className="h-5 w-5 text-primary/80" />
                                                    {subSubject}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pl-6">
                                                <Accordion type="multiple" className="w-full">
                                                    {Object.entries(chapters).map(([chapter, notesInChapter]) => (
                                                        <AccordionItem value={chapter} key={chapter}>
                                                            <AccordionTrigger>
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-5 w-5 text-primary/70" />
                                                                    {chapter}
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pl-6">
                                                                <ul className="space-y-3 py-2">
                                                                    {notesInChapter.map(note => (
                                                                    <li key={note.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                                                        <Label htmlFor={`access-${note.id}`} className="font-normal">{note.type}</Label>
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
                               </AccordionContent>
                             </AccordionItem>
                           ))}
                        </Accordion>
                     )}
                   </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>Close</Button>
                    <Button onClick={handleSave} disabled={!haveChanges || isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

