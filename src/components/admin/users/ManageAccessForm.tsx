

"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Library, Folder, FileText, Sparkles, ShieldCheck, BadgeCheck, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAllNotes, updateUserPermissions } from "@/lib/data";
import type { User, Note } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

type NoteItem = Note & { subjectName: string; subSubjectName: string; chapter: string; };

interface ManageAccessFormProps {
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

export function ManageAccessForm({ user }: ManageAccessFormProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [noteAccess, setNoteAccess] = useState<Set<string>>(new Set(user.noteAccess || []));
    const [hasAiAccess, setHasAiAccess] = useState(user.hasAiAccess !== false);
    const [hasFullNotesAccess, setHasFullNotesAccess] = useState(user.hasFullNotesAccess || false);
    const [attemptedQuizzes, setAttemptedQuizzes] = useState<Set<string>>(new Set(user.attemptedQuizzes || []));
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        setIsLoading(true);
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
    }, [toast]);

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
            const permissions = {
                noteAccess: Array.from(noteAccess),
                hasAiAccess,
                hasFullNotesAccess,
                attemptedQuizzes: Array.from(attemptedQuizzes),
            };
            const result = await updateUserPermissions(user.id, permissions);

            if (result.success) {
                toast({
                    title: "Access Updated",
                    description: "User permissions have been saved successfully.",
                });
                router.push("/admin/users");
            } else {
                toast({
                    title: "Update Failed",
                    description: result.error || "Could not update permissions.",
                    variant: "destructive",
                });
            }
        });
    };

    const groupedNotes = groupNotes(notes);
    
    const isUserAdmin = user.role === 'Admin';
    const isFullNotesAccessActive = isUserAdmin || hasFullNotesAccess;

    return (
        <div className="space-y-6">
                <div className="space-y-2">
                <h3 className="text-lg font-semibold">Special Permissions</h3>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="ai-access" className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-orange-400" />
                            AI Doubt Solver Access
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Allows the user to access the AI chat feature.
                        </p>
                    </div>
                    <Switch
                        id="ai-access"
                        checked={isUserAdmin || hasAiAccess}
                        onCheckedChange={setHasAiAccess}
                        disabled={isPending || isUserAdmin}
                    />
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="full-notes-access" className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-green-500" />
                            Grant Access to All Notes
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Allows the user to view all current and future notes.
                        </p>
                    </div>
                    <Switch
                        id="full-notes-access"
                        checked={isUserAdmin || hasFullNotesAccess}
                        onCheckedChange={setHasFullNotesAccess}
                        disabled={isPending || isUserAdmin}
                    />
                </div>
            </div>

            <Separator />
            
            <h3 className="text-lg font-semibold">Individual Note Access</h3>
            {isFullNotesAccessActive ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40 rounded-lg border border-dashed">
                        <ShieldCheck className="h-10 w-10 mb-2 text-green-500" />
                    <p className="font-semibold">{isUserAdmin ? "Admins have" : "This user has"} access to all notes.</p>
                    { !isUserAdmin && <p className="text-sm">Disable "Grant Access to All Notes" to manage individually.</p>}
                </div>
            ) : (
                <ScrollArea className="h-[50vh] pr-6 border rounded-md">
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
                                                        {Object.entries(chapters).map(([chapterName, notesInChapter]) => {
                                                            const firstNote = notesInChapter[0];
                                                            if(!firstNote) return null;
                                                            const chapterId = notesInChapter[0].chapterId.split('/')[2];
                                                            const hasAttemptedQuiz = user.attemptedQuizzes?.includes(chapterId);

                                                            return (
                                                                <AccordionItem value={chapterName} key={chapterName}>
                                                                    <AccordionTrigger>
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="flex items-center gap-2">
                                                                                <FileText className="h-5 w-5 text-primary/70" />
                                                                                {chapterName}
                                                                            </div>
                                                                            {hasAttemptedQuiz && (
                                                                                 <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p>Quiz Attempted</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
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
                                                            )
                                                        })}
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

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => router.push('/admin/users')} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
