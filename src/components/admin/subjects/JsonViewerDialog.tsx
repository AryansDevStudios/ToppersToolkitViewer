
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
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileJson, Copy } from "lucide-react";
import type { Subject } from "@/lib/types";

interface JsonViewerDialogProps {
  subjects: Subject[];
}

export function JsonViewerDialog({ subjects }: JsonViewerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const jsonString = JSON.stringify(subjects, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(
      () => {
        toast({
          title: "Copied to Clipboard",
          description: "The JSON data has been copied.",
        });
      },
      (err) => {
        toast({
          title: "Copy Failed",
          description: "Could not copy data to clipboard.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <FileJson className="mr-2 h-4 w-4" />
            View as JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Subjects Data (JSON)</DialogTitle>
          <DialogDescription>
            A read-only view of the entire subjects structure.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full rounded-md border">
                <pre className="p-4 text-sm">
                    <code>{jsonString}</code>
                </pre>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
