"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { upsertNote } from "@/lib/data";
import type { Note } from "@/lib/types";
import { useTransition } from "react";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  pdfUrl: z.string().url({ message: "Please enter a valid URL." }),
  type: z.enum(["Handwritten Notes", "Question Bank", "Others"]),
  chapterId: z.string().min(1, { message: "Please select a chapter." }),
});

interface NoteFormProps {
  chapters: { id: string; name: string }[];
  note?: Note & { chapterId?: string }; // Make note optional
}

export function NoteForm({ chapters, note }: NoteFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || "",
      pdfUrl: note?.pdfUrl || "",
      type: note?.type || "Handwritten Notes",
      chapterId: note?.chapterId || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await upsertNote({
        id: note?.id,
        ...values,
      });

      if (result.success) {
        toast({
          title: note ? "Note Updated" : "Note Created",
          description: `The note has been successfully ${
            note ? "updated" : "created"
          }.`,
        });
        router.push("/admin/notes");
        router.refresh();
      } else {
        toast({
          title: "Operation Failed",
          description: "Could not save the note.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Comprehensive Notes on Motion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pdfUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/note.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a note type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Handwritten Notes">
                        Handwritten Notes
                      </SelectItem>
                      <SelectItem value="Question Bank">Question Bank</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chapterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the chapter this note belongs to" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Note"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
