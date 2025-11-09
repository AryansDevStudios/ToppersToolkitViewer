
"use client";

import { useState } from 'react';
import type { AggregatedLog } from '@/app/admin/activity/page';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { Subject } from '@/lib/types';
import Link from 'next/link';

interface NoteDetailsDialogProps {
  log: AggregatedLog;
  subjects: Subject[];
}

export function NoteDetailsDialog({ log, subjects }: NoteDetailsDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Function to find note details
    const findNoteDetails = () => {
        for (const subject of subjects) {
            for (const subSubject of subject.subSubjects) {
                for (const chapter of subSubject.chapters) {
                    const note = chapter.notes.find(n => n.id === log.noteId);
                    if (note) {
                        return {
                            ...note,
                            subjectName: subject.name,
                            subSubjectName: subSubject.name,
                            chapterName: chapter.name,
                            slug: `/browse/${subject.id}/${subSubject.id}/${note.id}`
                        };
                    }
                }
            }
        }
        return null;
    };
    
    const noteDetails = findNoteDetails();

    if (!noteDetails) {
        return <span className="text-muted-foreground text-sm">{log.noteType} in "{log.chapterName}"</span>;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="link" size="sm" className="p-0 h-auto">
                    {log.noteType} in "{log.chapterName}"
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Note Details</DialogTitle>
                    <DialogDescription>
                        Full details for the note viewed by {log.userName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4 text-sm">
                    <p><strong>Note Type:</strong> {noteDetails.type}</p>
                    <p><strong>Chapter:</strong> {noteDetails.chapterName}</p>
                    <p><strong>Sub-Subject:</strong> {noteDetails.subSubjectName}</p>
                    <p><strong>Subject:</strong> {noteDetails.subjectName}</p>
                    <p><strong>Note ID:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">{noteDetails.id}</code></p>
                </div>
                <DialogFooter className="sm:justify-start">
                    <Button asChild>
                        <Link href={noteDetails.slug} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View Note
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
