
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { deleteSubject, deleteSubSubject, deleteChapter } from "@/lib/data";
import { Trash2 } from "lucide-react";

type ItemType = "Subject" | "Sub-Subject" | "Chapter";

interface DeleteDialogProps {
  type: ItemType;
  subjectId: string;
  subSubjectId?: string;
  chapterId?: string;
}

export function DeleteDialog({ type, subjectId, subSubjectId, chapterId }: DeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      let result;
      try {
        if (type === "Subject") {
          result = await deleteSubject(subjectId);
        } else if (type === "Sub-Subject" && subSubjectId) {
          result = await deleteSubSubject(subjectId, subSubjectId);
        } else if (type === "Chapter" && subSubjectId && chapterId) {
          result = await deleteChapter(subjectId, subSubjectId, chapterId);
        } else {
            throw new Error("Invalid parameters for deletion.");
        }

        if (result.success) {
          toast({ title: `${type} Deleted`, description: result.message });
          router.refresh(); 
          setIsOpen(false);
        } else {
          throw new Error(result.error || `Failed to delete the ${type}.`);
        }
      } catch (e: any) {
         toast({
          title: "Error",
          description: e.message || `Failed to delete the ${type}.`,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete {type}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the {type}
            {type !== 'Subject' ? ' from the database.' : ' and all its related sub-subjects, chapters, and notes.'}
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
