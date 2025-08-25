

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
import { KeyRound, Loader2, Library, Folder, FileText, Sparkles, UserCheck, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAllNotes, updateUserAccessBatch, updateUserAiAccess } from "@/lib/data";
import type { User, Note } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
    const [noteAccess, setNoteAccess] = useState<Set<string>>(new Set());
    const [hasAiAccess, setHasAiAccess] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const initialNoteAccess = useMemo(() => new Set(user.noteAccess || []), [user.noteAccess]);
    const initialAiAccess = useMemo(() => !!user.hasAiAccess, [user.hasAiAccess]);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setNoteAccess(new Set(user.noteAccess || []));
            setHasAiAccess(!!user.hasAiAccess);
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
    }, [isOpen, user.noteAccess, user.hasAiAccess, toast]);

    const handleNoteAccessChange = (noteId: string, newAccess: boolean) => {
        setNoteAccess(prev => {
            const newSet = new Set(prev);
            if (newAccess) newSet.add(noteId);
            else newSet.delete(noteId);
            return newSet;
        });
    };
    
    const handleSave = () => {
        startTransition(async () => {
            const accessArray = Array.from(noteAccess);
            const accessResult = await updateUserAccessBatch(user.id, accessArray);
            const aiAccessResult = await updateUserAiAccess(user.id, hasAiAccess);

            if (accessResult.success && aiAccessResult.success) {
                toast({
                    title: "Access Updated",
                    description: "User permissions have been saved successfully.",
                });
                setIsOpen(false);
            } else {
                toast({
                    title: "Update Failed",
                    description: accessResult.error || aiAccessResult.error || "Could not update permissions.",
                    variant: "destructive",
                });
            }
        });
    };

    const groupedNotes = groupNotes(notes);
    
    const haveChanges = useMemo(() => {
        if (initialNoteAccess.size !== noteAccess.size) return true;
        for (const id of initialNoteAccess) {
            if (!noteAccess.has(id)) return true;
        }
        if(initialAiAccess !== hasAiAccess) return true;
        return false;
    }, [initialNoteAccess, noteAccess, initialAiAccess, hasAiAccess]);

    const isUserAdmin = user.role === 'Admin';

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
                    <DialogTitle>Manage Access for {user.name}</DialogTitle>
                    <DialogDescription>
                        Grant or revoke access to specific features and notes.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-4 text-lg font-semibold">Feature Access</h3>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="ai-access" className="flex items-center gap-2 font-normal">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <span>AI Doubt Solver Access</span>
                            </Label>
                             {isUserAdmin ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    <span>Admin has permanent access</span>
                                </div>
                            ) : (
                                <Switch
                                    id="ai-access"
                                    checked={hasAiAccess}
                                    onCheckedChange={setHasAiAccess}
                                    disabled={isPending || isUserAdmin}
                                />
                            )}
                        </div>
                    </div>

                    <Separator />
                    
                    <h3 className="text-lg font-semibold">Note Access</h3>
                    {isUserAdmin ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40 rounded-lg border border-dashed">
                             <ShieldCheck className="h-10 w-10 mb-2 text-green-500" />
                            <p className="font-semibold">Admins have access to all notes.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[40vh] pr-6 border rounded-md">
                           <div className="p-4">
                             {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                             ) : (
                                <TooltipProvider>
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
                                                                                {notesInChapter.map(note => {
                                                                                    const isPublic = note.isPublic || false;
                                                                                    const hasAccess = isPublic || noteAccess.has(note.id);

                                                                                    const switchControl = (
                                                                                        <Switch
                                                                                            id={`access-${note.id}`}
                                                                                            checked={hasAccess}
                                                                                            onCheckedChange={(checked) => handleNoteAccessChange(note.id, checked)}
                                                                                            disabled={isPending || isPublic}
                                                                                        />
                                                                                    );
                                                                                    
                                                                                    return (
                                                                                        <li key={note.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                                                                            <Label htmlFor={`access-${note.id}`} className={cn("font-normal", isPublic && "text-muted-foreground")}>{note.type}</Label>
                                                                                            {isPublic ? (
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger asChild>{switchControl}</TooltipTrigger>
                                                                                                    <TooltipContent>
                                                                                                        <p>This note is public and accessible by all users.</p>
                                                                                                    </TooltipContent>
                                                                                                </Tooltip>
                                                                                            ) : switchControl}
                                                                                        </li>
                                                                                    )
                                                                                })}
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
                                </TooltipProvider>
                             )}
                           </div>
                        </ScrollArea>
                    )}
                </div>
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
