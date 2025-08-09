"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteNote } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface DeleteNoteDialogProps {
  noteId: string;
}

export function DeleteNoteDialog({ noteId }: DeleteNoteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      // Note: This currently uses a mock implementation.
      const result = await deleteNote(noteId);
      if (result.success) {
        toast({ title: "Note Action", description: "This is a demo. No data was deleted." });
        router.refresh(); // To reflect changes if data source was live
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete the note.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the note
            from our servers. (This is a demo and will not actually delete anything).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
