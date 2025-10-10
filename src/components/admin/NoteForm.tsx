
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
import { useTransition, useState, useEffect, useCallback, useMemo } from "react";
import { iconMap, iconNames } from "@/lib/iconMap";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DeleteNoteDialog } from "./DeleteNoteDialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertTriangle, Copy, X } from "lucide-react";

const noteObjectSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  subSubjectId: z.string().min(1, "Sub-subject ID is required"),
  chapterName: z.string().min(1, "Chapter name is required"),
  type: z.string().min(1, "Type is required"),
  url: z.string().url("A valid URL is required"),
  renderAs: z.enum(["pdf", "iframe"]),
  linkType: z.enum(["github", "other"]).optional(),
  serveViaJsDelivr: z.boolean().optional(),
  proxyType: z.enum(["none", "netlify", "render"]).optional(),
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

  const [isChapterSuggestionsOpen, setIsChapterSuggestionsOpen] = useState(false);
  const [isTypeSuggestionsOpen, setIsTypeSuggestionsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: note?.subjectId || "",
      subSubjectId: note?.subSubjectId || "",
      chapterName: note?.chapterName || "",
      type: note?.type || "",
      url: note?.originalUrl || note?.url || note?.pdfUrl || "",
      renderAs: note?.renderAs === 'iframe' ? 'iframe' : 'pdf',
      linkType: note?.linkType || "other",
      serveViaJsDelivr: note?.serveViaJsDelivr === undefined ? true : note.serveViaJsDelivr,
      proxyType: note?.proxyType || 'render',
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
      form.reset(parsed, { keepDefaultValues: false });
      setJsonError(null);
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
  const selectedSubSubjectId = formValues.subSubjectId;
  const chapterNameValue = formValues.chapterName;
  const noteTypeValue = formValues.type;
  const renderAs = formValues.renderAs;
  const linkType = formValues.linkType;

  const subSubjects = selectedSubjectId
    ? subjects.find((s) => s.id === selectedSubjectId)?.subSubjects || []
    : [];
    
  const availableChapters = useMemo(() => {
    if (!selectedSubSubjectId) return [];
    const subSubject = subSubjects.find(ss => ss.id === selectedSubSubjectId);
    return subSubject?.chapters.map(c => c.name) || [];
  }, [selectedSubSubjectId, subSubjects]);

  const filteredChapters = useMemo(() => {
      if (!chapterNameValue) return availableChapters;
      const lowerCaseQuery = chapterNameValue.toLowerCase();
      return availableChapters.filter(name => name.toLowerCase().includes(lowerCaseQuery));
  }, [chapterNameValue, availableChapters]);

  const allNoteTypes = useMemo(() => {
    const types = new Set<string>();
    subjects.forEach(subject => {
        subject.subSubjects?.forEach(subSubject => {
            subSubject.chapters?.forEach(chapter => {
                chapter.notes?.forEach(note => {
                    types.add(note.type);
                });
            });
        });
    });
    return Array.from(types).sort();
  }, [subjects]);

  const existingNoteTypesInChapter = useMemo(() => {
    if (!selectedSubSubjectId || !chapterNameValue) return new Set();
    const subSubject = subSubjects.find(ss => ss.id === selectedSubSubjectId);
    const chapter = subSubject?.chapters.find(c => c.name === chapterNameValue);
    return new Set(chapter?.notes?.map(n => n.type) || []);
  }, [selectedSubSubjectId, chapterNameValue, subSubjects]);

  const filteredNoteTypes = useMemo(() => {
    if (!noteTypeValue) return allNoteTypes;
    const lowerCaseQuery = noteTypeValue.toLowerCase();
    return allNoteTypes.filter(type => type.toLowerCase().includes(lowerCaseQuery));
  }, [noteTypeValue, allNoteTypes]);


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
        proxyType: values.renderAs === 'iframe' ? undefined : values.proxyType,
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
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            form.setValue("chapterName", "");
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
                            onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("chapterName", "");
                            }}
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="chapterName"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormLabel>Chapter Name</FormLabel>
                          <div className="relative">
                            <FormControl>
                                <Input 
                                    placeholder="e.g., Motion" 
                                    {...field} 
                                    disabled={isPending || !selectedSubSubjectId}
                                    onFocus={() => setIsChapterSuggestionsOpen(true)}
                                    onBlur={() => setTimeout(() => setIsChapterSuggestionsOpen(false), 150)}
                                    autoComplete="off"
                                    className="pr-8"
                                />
                            </FormControl>
                            {field.value && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => form.setValue('chapterName', '')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                          </div>
                           {isChapterSuggestionsOpen && filteredChapters.length > 0 && (
                                <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {filteredChapters.map((chapter, index) => (
                                        <div
                                            key={index}
                                            className="p-2 hover:bg-accent cursor-pointer text-sm"
                                            onClick={() => {
                                                form.setValue("chapterName", chapter);
                                                setIsChapterSuggestionsOpen(false);
                                            }}
                                        >
                                            {chapter}
                                        </div>
                                    ))}
                                </div>
                            )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormLabel>Note Type</FormLabel>
                           <div className="relative">
                                <FormControl>
                                    <Input 
                                        placeholder="e.g., Handwritten Notes, Question Bank" 
                                        {...field} 
                                        disabled={isPending}
                                        onFocus={() => setIsTypeSuggestionsOpen(true)}
                                        onBlur={() => setTimeout(() => setIsTypeSuggestionsOpen(false), 150)}
                                        autoComplete="off"
                                        className="pr-8"
                                    />
                                </FormControl>
                                {field.value && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                                        onClick={() => form.setValue('type', '')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                          {isTypeSuggestionsOpen && filteredNoteTypes.length > 0 && (
                                <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {filteredNoteTypes.map((type, index) => {
                                        const isExisting = existingNoteTypesInChapter.has(type);
                                        return (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "p-2 text-sm",
                                                    isExisting 
                                                        ? "text-green-600 font-semibold cursor-not-allowed" 
                                                        : "hover:bg-accent cursor-pointer"
                                                )}
                                                onClick={() => {
                                                    if (!isExisting) {
                                                        form.setValue("type", type);
                                                        setIsTypeSuggestionsOpen(false);
                                                    }
                                                }}
                                            >
                                                {type}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                              name="proxyType"
                              render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proxy Service</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a proxy service" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="render">Render Proxy (Recommended)</SelectItem>
                                            <SelectItem value="netlify">Netlify Proxy</SelectItem>
                                            <SelectItem value="none">No Proxy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Use a proxy to avoid potential CORS issues with some URLs.
                                    </FormDescription>
                                    <FormMessage />
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
                  <div className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">JSON Editor</h3>
                          <Button type="button" variant="outline" size="sm" onClick={handleCopyJson}>
                              <Copy className="mr-2 h-4 w-4" /> Copy JSON
                          </Button>
                      </div>
                       <div className="relative">
                          <Textarea 
                              value={jsonText}
                              onChange={handleJsonChange}
                              onFocus={() => setIsEditingJson(true)}
                              onBlur={() => setIsEditingJson(false)}
                              placeholder='{ "type": "...", "url": "..." }'
                              className={cn("min-h-[250px] resize-y font-mono text-xs", jsonError && "border-destructive focus-visible:ring-destructive")}
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.push('/admin/notes')} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !!jsonError}>
                {isPending ? "Submitting..." : isEditing ? "Save Changes" : "Upload Note"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
