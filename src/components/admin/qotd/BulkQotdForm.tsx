
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { bulkCreateQuestionsOfTheDay } from "@/lib/data";
import { Loader2, AlertTriangle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

const optionSchema = z.object({
  text: z.string(),
});

const qotdObjectSchema = z.object({
  question: z.string(),
  options: z.array(optionSchema),
  correctOptionIndex: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
});

const bulkSchema = z.array(qotdObjectSchema);

const demoJson = JSON.stringify([
  {
    "question": "What is 2 + 2?",
    "options": [{ "text": "3" }, { "text": "4" }],
    "correctOptionIndex": 1,
    "date": "2024-08-15"
  },
  {
    "question": "What is the color of the sky on a clear day?",
    "options": [{ "text": "Blue" }, { "text": "Green" }, { "text": "Red" }],
    "correctOptionIndex": 0,
    "date": "2024-08-16"
  }
], null, 2);

interface BulkQotdFormProps {
  children: React.ReactNode;
}

export function BulkQotdForm({ children }: BulkQotdFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJson = e.target.value;
    setJsonText(newJson);
    try {
      const parsed = JSON.parse(newJson);
      bulkSchema.parse(parsed);
      setJsonError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setJsonError(`Validation Error: ${error.errors[0].path.join('.')} - ${error.errors[0].message}`);
      } else {
        setJsonError("Invalid JSON structure.");
      }
    }
  };

  const handleCopyDemo = () => {
    navigator.clipboard.writeText(demoJson).then(() => {
        toast({ title: "Copied!", description: "Demo JSON copied to clipboard." });
    }, () => {
        toast({ title: "Failed to copy", variant: "destructive" });
    });
  };

  const handleSubmit = () => {
    if (jsonError || !jsonText) {
      toast({ title: "Cannot Submit", description: "Please provide valid JSON.", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      const result = await bulkCreateQuestionsOfTheDay(jsonText);
      if (result.success) {
        toast({ title: "Success", description: `${result.count} questions were uploaded.` });
        setIsOpen(false);
        setJsonText("");
        setJsonError(null);
        router.refresh();
      } else {
        toast({ title: "Upload Failed", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Questions of the Day</DialogTitle>
          <DialogDescription>
            Paste an array of question objects in the editor below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={handleCopyDemo}>
                <Copy className="mr-2 h-4 w-4" /> Copy Demo JSON
            </Button>
        </div>
        <div className="relative">
          <Textarea
            value={jsonText}
            onChange={handleJsonChange}
            placeholder={demoJson}
            className={cn("min-h-[300px] resize-y font-mono text-xs", jsonError && "border-destructive focus-visible:ring-destructive")}
          />
          {jsonError && (
            <div className="absolute bottom-2 left-2 right-2 p-2 bg-destructive/10 border border-destructive/50 text-destructive text-xs rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p>{jsonError}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !!jsonError || !jsonText}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Uploading..." : "Upload Questions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
