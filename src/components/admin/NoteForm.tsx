
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
import { useTransition, useState, useEffect, useCallback } from "react";
import { iconMap, iconNames } from "@/lib/iconMap";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DeleteNoteDialog } from "./DeleteNoteDialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertTriangle, Copy } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

const noteObjectSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  subSubjectId: z.string().min(1, "Sub-subject ID is required"),
  chapterName: z.string().min(1, "Chapter name is required"),
  type: z.string().min(1, "Type is required"),
  url: z.string().url("A valid URL is required"),
  renderAs: z.enum(["pdf", "iframe"]),
  linkType: z.enum(["github", "other"]).optional(),
  serveViaJsDelivr: z.boolean().optional(),
  useProxy: z.boolean().optional(),
  icon: z.string().optional(),
  isPublic: z.boolean().optional(),
}).refine(data => {
    if (data.renderAs !== 'iframe') return !!data.linkType;
    return true;
}, { message: "Link type is required for PDFs.", path: ["linkType"] });

const formSchema = noteObjectSchema;

type SerializableSubject = Omit<Subject, 'icon'>;
interface NoteFormProps {
  subjects: SerializableSubject[];
  note?: Note & { chapterId?: string; subjectId?: string; subSubjectId?: string; chapterName?: string; };
}

export function NoteForm({ subjects, note }: NoteFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!note?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: note?.subjectId || "",
      subSubjectId: note?.subSubjectId || "",
      chapterName: note?.chapterName || "",
      type: note?.type || "",
      url: note?.originalUrl || note?.url || note?.pdfUrl || "",
      renderAs: note?.renderAs === 'iframe' ? 'iframe' : 'pdf',
      linkType: note?.linkType || "github",
      serveViaJsDelivr: note?.serveViaJsDelivr === undefined ? true : note.serveViaJsDelivr,
      useProxy: note?.useProxy === undefined ? true : note.useProxy,
      icon: note?.icon || "",
      isPublic: note?.isPublic || false,
    },
  });

  const [jsonText, setJsonText] = useState(() => JSON.stringify(form.getValues(), null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isEditingJson, setIsEditingJson] = useState(false);

  const formValues = useWatch({ control: form.control });

  const updateFormFromJson = useCallback((newJson: string) => {
    try {
      const parsed = JSON.parse(newJson);
      const validationResult = formSchema.safeParse(parsed);
      if (validationResult.success) {
        form.reset(validationResult.data);
        setJsonError(null);
      } else {
        setJsonError(validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '));
      }
    } catch (e) {
      setJsonError("Invalid JSON syntax.");
    }
  }, [form]);


  useEffect(() => {
    if (!isEditingJson) {
      setJsonText(JSON.stringify(formValues, null, 2));
    }
  }, [formValues, isEditingJson]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJson = e.target.value;
    setJsonText(newJson);
    updateFormFromJson(newJson);
  };
  
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText).then(() => {
        toast({ title: "Copied!", description: "JSON data copied to clipboard." });
    }, () => {
        toast({ title: "Failed to copy", variant: "destructive" });
    });
  };

  const selectedSubjectId = formValues.subjectId;
  const renderAs = formValues.renderAs;
  const linkType = formValues.linkType;

  const subSubjects = selectedSubjectId
    ? subjects.find((s) => s.id === selectedSubjectId)?.subSubjects || []
    : [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const dataToSubmit = {
        id: note?.id,
        ...values,
        chapterName: values.chapterName.trim(),
        type: values.type.trim(),
        icon: values.icon,
        linkType: values.renderAs === 'iframe' ? undefined : values.linkType,
        serveViaJsDelivr: values.renderAs === 'iframe' ? undefined : values.serveViaJsDelivr,
        useProxy: values.renderAs === 'iframe' ? undefined : values.useProxy,
      };

      const result = await upsertNote(dataToSubmit);

      if (result.success) {
        toast({ title: "Success", description: result.message });
        if (isEditing) {
          router.push("/admin/notes");
        } else {
          form.reset({
            ...form.getValues(),
            type: "", url: "", icon: "", isPublic: false
          });
          router.refresh();
        }
      } else {
        toast({ title: "Operation Failed", description: result.error || "Could not save the note.", variant: "destructive" });
      }
    });
  }

  const compositeChapterId = isEditing && note?.chapterId ? `${note.subjectId}/${note.subSubjectId}/${note.chapterId}` : undefined;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Fields Column */}
              <ScrollArea className="h-[70vh] pr-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("subSubjectId", "");
                          }}
                          defaultValue={field.value}
                          disabled={isPending}
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
                            value={field.value}
                            disabled={isPending}
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
                          <Input placeholder="e.g., Motion" {...field} disabled={isPending} />
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
                          <Input placeholder="e.g., Handwritten Notes, Question Bank" {...field} disabled={isPending}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Make Public</FormLabel>
                                <FormDescription>
                                    Allow access to all registered users.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isPending}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="renderAs"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Render As</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            disabled={isPending}
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="pdf" />
                              </FormControl>
                              <FormLabel className="font-normal">PDF</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="iframe" />
                              </FormControl>
                              <FormLabel className="font-normal">Iframe</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} disabled={isPending} />
                        </FormControl>
                        {renderAs !== 'iframe' && (
                          <FormDescription>
                            {linkType === 'github' ? "Enter the standard GitHub blob URL." : "Enter the direct URL to the content."}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {renderAs !== 'iframe' && (
                    <>
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
                                disabled={isPending}
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
                                              disabled={isPending}
                                          />
                                      </FormControl>
                                  </FormItem>
                              )}
                          />
                      )}
                      {linkType === 'other' && (
                          <FormField
                              control={form.control}
                              name="useProxy"
                              render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                      <div className="space-y-0.5">
                                          <FormLabel>Use Proxy API</FormLabel>
                                          <FormDescription>
                                              Route URL through the Netlify proxy to avoid CORS issues.
                                          </FormDescription>
                                      </div>
                                      <FormControl>
                                          <Switch
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                              disabled={isPending}
                                          />
                                      </FormControl>
                                  </FormItem>
                              )}
                          />
                      )}
                    </>
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
                          disabled={isPending}
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
                </div>
              </ScrollArea>

              {/* JSON Editor Column */}
              <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">JSON Editor</h3>
                      <Button type="button" variant="outline" size="sm" onClick={handleCopyJson}>
                          <Copy className="mr-2 h-4 w-4" /> Copy JSON
                      </Button>
                  </div>
                  <div className="flex-1 flex flex-col relative min-h-[70vh]">
                      <Textarea 
                          value={jsonText}
                          onChange={handleJsonChange}
                          onFocus={() => setIsEditingJson(true)}
                          onBlur={() => setIsEditingJson(false)}
                          placeholder='{ "type": "...", "url": "..." }'
                          className={cn("h-full min-h-[70vh] resize-none font-mono text-xs flex-1", jsonError && "border-destructive focus-visible:ring-destructive")}
                      />
                      {jsonError && (
                          <div className="absolute bottom-2 left-2 right-2 p-2 bg-destructive/10 border border-destructive/50 text-destructive text-xs rounded-md flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              {jsonError}
                          </div>
                      )}
                  </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-6">
            <div>
              {isEditing && note?.id && compositeChapterId && (
                <DeleteNoteDialog 
                  noteId={note.id} 
                  chapterId={compositeChapterId} 
                  isTriggerButton
                />
              )}
            </div>
            <Button type="submit" disabled={isPending || !!jsonError}>
              {isPending ? "Submitting..." : isEditing ? "Save Changes" : "Upload Note"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    