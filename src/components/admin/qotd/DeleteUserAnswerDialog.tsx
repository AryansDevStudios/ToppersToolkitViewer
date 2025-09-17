
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
import { deleteUserQotdAnswer } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface DeleteUserAnswerDialogProps {
  userId: string;
  questionId: string;
  onDeleteSuccess: () => void;
}

export function DeleteUserAnswerDialog({ userId, questionId, onDeleteSuccess }: DeleteUserAnswerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserQotdAnswer(userId, questionId);
      if (result.success) {
        toast({ title: "Answer Deleted", description: "The user can now answer this question again." });
        onDeleteSuccess(); // Refresh the list in the parent dialog
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete the answer.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete Answer</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete this user's answer for this question. They will be able to answer it again. This will not affect their score.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete Answer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
