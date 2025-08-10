
"use client";

import { useForm, useWatch } from "react-hook-form";
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
  FormDescription,
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
import type { Note, Subject } from "@/lib/types";
import { useTransition } from "react";
import { iconMap, iconNames } from "@/lib/iconMap";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  subjectId: z.string().min(1, { message: "Please select a subject." }),
  subSubjectId: z.string().min(1, { message: "Please select a sub-subject." }),
  chapterName: z.string().min(1, { message: "Chapter Name is required." }),
  type: z.string().min(1, { message: "Note type is required." }),
  pdfUrl: z.string().url({ message: "Please enter a valid URL." }),
  linkType: z.enum(["github", "other"]),
  serveViaJsDelivr: z.boolean(),
  icon: z.string().optional(),
});

// We expect a version of Subject without the icon for client-side components
type SerializableSubject = Omit<Subject, 'icon'>;
interface NoteFormProps {
  subjects: SerializableSubject[];
  note?: Note & { chapterId?: string; subjectId?: string; subSubjectId?: string; chapterName?: string; };
}

export function NoteForm({ subjects, note }: NoteFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: note?.subjectId || "",
      subSubjectId: note?.subSubjectId || "",
      chapterName: note?.chapterName || "",
      type: note?.type || "",
      pdfUrl: note?.originalPdfUrl || note?.pdfUrl || "",
      linkType: note?.linkType || "other",
      serveViaJsDelivr: note?.serveViaJsDelivr === undefined ? true : note.serveViaJsDelivr,
      icon: note?.icon || "",
    },
  });

  const selectedSubjectId = useWatch({
    control: form.control,
    name: "subjectId",
  });
  
  const linkType = useWatch({
      control: form.control,
      name: "linkType",
  });

  const subSubjects = selectedSubjectId
    ? subjects.find((s) => s.id === selectedSubjectId)?.subSubjects || []
    : [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await upsertNote({
        id: note?.id,
        ...values,
        chapterName: values.chapterName.trim(),
        type: values.type.trim(),
        icon: values.icon,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        router.push("/admin/notes");
        router.refresh();
      } else {
        toast({
          title: "Operation Failed",
          description: result.error || "Could not save the note.",
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
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("subSubjectId", ""); // Reset sub-subject on subject change
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedSubjectId && (
              <FormField
                control={form.control}
                name="subSubjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sub-subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subSubjects.map((subSubject) => (
                          <SelectItem key={subSubject.id} value={subSubject.id}>
                            {subSubject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="chapterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Motion" {...field} />
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
                  <FormControl>
                    <Input placeholder="e.g., Handwritten Notes, Question Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Link Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="github" />
                        </FormControl>
                        <FormLabel className="font-normal">GitHub</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
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
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                   <FormDescription>
                    {linkType === 'github' ? "Enter the standard GitHub blob URL." : "Enter the direct URL to the PDF."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {linkType === 'github' && (
                <FormField
                    control={form.control}
                    name="serveViaJsDelivr"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Serve via jsDelivr</FormLabel>
                                <FormDescription>
                                    Convert GitHub link to a faster jsDelivr CDN link.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            )}
             <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon for the note" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconNames.map((iconName) => {
                         const Icon = iconMap[iconName];
                         return(
                            <SelectItem key={iconName} value={iconName}>
                               <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{iconName}</span>
                               </div>
                            </SelectItem>
                         )
                        })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : note?.id ? "Save Changes" : "Upload Note"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
