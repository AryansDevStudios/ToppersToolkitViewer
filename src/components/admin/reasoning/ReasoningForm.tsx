
"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useCallback } from "react";
import { upsertReasoningSet } from "@/lib/data";
import type { ReasoningMCQ, ReasoningSet } from "@/lib/types";
import { PlusCircle, Trash2, Image as ImageIcon, Copy, AlertTriangle, Eye, ChevronLeft, ChevronRight, Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DeleteReasoningDialog } from "./DeleteReasoningDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

const singleMcqObjectSchema = z.object({
  id: z.string().optional(),
  question: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  options: z.array(z.object({
    text: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
  }).refine(opt => opt.text || opt.imageUrl, { message: "Each option must have either text or an image URL." })).min(2, "At least two options are required."),
  correctOptionIndex: z.number().min(0, "You must select a correct answer."),
}).refine(data => data.question || data.imageUrl, { message: "Question must have either text or an image URL.", path: ["question"] });

const formSchema = z.object({
  name: z.string().min(1, "Set Name is required."),
  mcqs: z.array(singleMcqObjectSchema).min(1, "At least one question is required."),
});

interface ReasoningFormProps {
  set?: ReasoningSet; 
}

const defaultMcqValue: Omit<ReasoningMCQ, 'id'> = { 
  question: "", 
  imageUrl: "", 
  options: [
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" }
  ], 
  correctOptionIndex: -1 
};

const demoJson = JSON.stringify([
  {
    "question": "Which pattern is next in the sequence?",
    "imageUrl": "https://picsum.photos/seed/seq1/400/200",
    "options": [
      { "text": "Option A", "imageUrl": "https://picsum.photos/seed/opt1/150/150" },
      { "text": "Option B", "imageUrl": "https://picsum.photos/seed/opt2/150/150" },
      { "text": "Option C", "imageUrl": "https://picsum.photos/seed/opt3/150/150" },
      { "text": "Option D", "imageUrl": "https://picsum.photos/seed/opt4/150/150" }
    ],
    "correctOptionIndex": 2
  }
], null, 2);

const isValidUrl = (url: string | undefined): url is string => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const PreviewQuestion = ({ question }: { question: ReasoningMCQ | undefined }) => {
    if (!question) {
        return <div className="text-center text-muted-foreground p-8">Select a question to preview</div>;
    }
    return (
        <div className="space-y-4">
            {question.question && <h4 className="font-semibold text-lg">{question.question}</h4>}
            {isValidUrl(question.imageUrl) && (
                <div className="relative h-48 w-full bg-muted rounded-md overflow-hidden border">
                    <Image src={question.imageUrl} alt="Question visual" layout="fill" objectFit="contain" />
                </div>
            )}
            <div className="grid grid-cols-2 gap-3">
                {question.options.map((opt, index) => (
                    <div key={index} className={cn(
                        "border p-2 rounded-md space-y-2",
                        index === question.correctOptionIndex && "border-green-500 ring-2 ring-green-500/50"
                    )}>
                        {isValidUrl(opt.imageUrl) && (
                            <div className="relative h-24 w-full bg-muted rounded-sm overflow-hidden">
                                <Image src={opt.imageUrl} alt={`Option ${index + 1}`} layout="fill" objectFit="contain" />
                            </div>
                        )}
                        {opt.text && <p className="text-sm text-center">{opt.text}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export function ReasoningForm({ set }: ReasoningFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const isEditing = !!set;

  // Sanitize incoming set data to ensure no undefined values for controlled components
  const sanitizedMcqs = useMemo(() => {
    if (!set?.mcqs || set.mcqs.length === 0) {
      return [defaultMcqValue];
    }
    return set.mcqs.map(mcq => ({
      ...mcq,
      question: mcq.question ?? "",
      imageUrl: mcq.imageUrl ?? "",
      options: (mcq.options || []).map(opt => ({
        text: opt.text ?? "",
        imageUrl: opt.imageUrl ?? "",
      })),
    }));
  }, [set]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: set?.name || "",
      mcqs: sanitizedMcqs,
    },
    mode: "onBlur",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "mcqs",
  });
  
  const watchedMcqs = useWatch({ control: form.control, name: 'mcqs' });
  const [jsonText, setJsonText] = useState(() => JSON.stringify(watchedMcqs, null, 2));

   const updateFormFromJson = useCallback((newJson: string) => {
    try {
        const parsed = JSON.parse(newJson);
        const validationResult = z.array(singleMcqObjectSchema).safeParse(parsed);
        if(validationResult.success) {
            replace(validationResult.data);
            setJsonError(null);
        } else {
            setJsonError("JSON does not match the required format.");
        }
    } catch (e) {
      setJsonError("Invalid JSON syntax.");
    }
  }, [replace]);

  useEffect(() => {
    if (!isEditingJson) {
        setJsonText(JSON.stringify(watchedMcqs, null, 2));
    }
  }, [watchedMcqs, isEditingJson]);
  
   useEffect(() => {
    if (previewIndex >= watchedMcqs.length) {
      setPreviewIndex(Math.max(0, watchedMcqs.length - 1));
    }
  }, [watchedMcqs, previewIndex]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newJson = e.target.value;
      setJsonText(newJson);
      updateFormFromJson(newJson);
  }
  
  const handleCopyDemo = () => {
    navigator.clipboard.writeText(demoJson).then(() => {
        toast({ title: "Copied!", description: "Demo JSON copied to clipboard." });
    }, () => {
        toast({ title: "Failed to copy", variant: "destructive" });
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await upsertReasoningSet({
        id: set?.id,
        ...values,
      });

      if (result.success) {
        toast({ title: "Success", description: `Set successfully ${isEditing ? 'updated' : 'created'}.` });
        router.push("/admin/reasoning");
      } else {
        toast({ title: "Operation Failed", description: result.error || "Could not save the set.", variant: "destructive" });
      }
    });
  }

  return (
    <Card>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Set Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="E.g., Visual Patterns - Set 1" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Separator />

                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button type="button" variant="outline" size="sm">
                                    <Code className="mr-2 h-4 w-4" />
                                    Show/Hide JSON Editor
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">JSON Editor</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={handleCopyDemo}>
                                            <Copy className="mr-2 h-4 w-4" /> Copy Demo
                                        </Button>
                                    </div>
                                    <div className="flex-1 flex flex-col relative min-h-[300px]">
                                        <Textarea 
                                            value={jsonText}
                                            onChange={handleJsonChange}
                                            onFocus={() => setIsEditingJson(true)}
                                            onBlur={() => setIsEditingJson(false)}
                                            placeholder='[ { "question": "...", "options": [...], "correctOptionIndex": 0 } ]'
                                            className={cn("h-full resize-none font-mono text-xs flex-1", jsonError && "border-destructive focus-visible:ring-destructive")}
                                        />
                                        {jsonError && (
                                            <div className="absolute bottom-2 left-2 right-2 p-2 bg-destructive/10 border border-destructive/50 text-destructive text-xs rounded-md flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                {jsonError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                        
                        <Separator />

                        <h3 className="text-lg font-semibold pt-4">Questions Editor</h3>
                        <ScrollArea className="h-[70vh] pr-4 -mr-4">
                            <div className="space-y-6">
                                {fields.map((mcqField, mcqIndex) => (
                                    <div key={mcqField.id} className="p-4 border rounded-lg space-y-4 relative bg-card">
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => remove(mcqIndex)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <FormField
                                            control={form.control}
                                            name={`mcqs.${mcqIndex}.question`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Question {mcqIndex + 1}</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Which shape comes next?" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`mcqs.${mcqIndex}.imageUrl`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Image URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://example.com/image.png" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div>
                                            <FormLabel>Options</FormLabel>
                                            <div className="space-y-3 mt-2">
                                                {mcqField.options.map((_, optionIndex) => (
                                                    <div key={`${mcqField.id}-option-${optionIndex}`} className="p-3 border rounded-md bg-muted/50 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant={form.watch(`mcqs.${mcqIndex}.correctOptionIndex`) === optionIndex ? 'default' : 'outline'}
                                                                onClick={() => form.setValue(`mcqs.${mcqIndex}.correctOptionIndex`, optionIndex, { shouldValidate: true })}
                                                                className="h-9 w-20 shrink-0"
                                                            >
                                                                {form.watch(`mcqs.${mcqIndex}.correctOptionIndex`) === optionIndex ? 'Correct' : 'Mark'}
                                                            </Button>
                                                            <FormField
                                                            control={form.control}
                                                            name={`mcqs.${mcqIndex}.options.${optionIndex}.text`}
                                                            render={({ field: optionField }) => (
                                                                <FormControl>
                                                                    <Input {...optionField} placeholder={`Opt ${optionIndex + 1} Text`} className="h-9" />
                                                                </FormControl>
                                                            )}
                                                            />
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name={`mcqs.${mcqIndex}.options.${optionIndex}.imageUrl`}
                                                            render={({ field: optionField }) => (
                                                                <FormControl>
                                                                    <Input {...optionField} placeholder={`Opt ${optionIndex + 1} Image URL`} className="h-9" />
                                                                </FormControl>
                                                            )}
                                                            />
                                                    </div>
                                                ))}
                                            </div>
                                            {form.formState.errors?.mcqs?.[mcqIndex]?.correctOptionIndex && (
                                                <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.mcqs[mcqIndex]?.correctOptionIndex?.message}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append(defaultMcqValue)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                                </Button>
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-4 sticky top-24 h-fit">
                        <h3 className="text-lg font-semibold">Live Preview</h3>
                        <div className="p-4 border rounded-lg bg-muted/30 flex-1 min-h-[400px]">
                            <PreviewQuestion question={watchedMcqs[previewIndex]} />
                        </div>
                         <div className="flex items-center justify-between">
                            <Button type="button" variant="outline" size="sm" onClick={() => setPreviewIndex(p => Math.max(0, p - 1))} disabled={previewIndex === 0}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {previewIndex + 1} / {watchedMcqs.length}
                            </span>
                            <Button type="button" variant="outline" size="sm" onClick={() => setPreviewIndex(p => Math.min(watchedMcqs.length - 1, p + 1))} disabled={previewIndex >= watchedMcqs.length - 1}>
                                Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-6">
                <div>
                  {isEditing && set?.id && (
                    <DeleteReasoningDialog setId={set.id} isTriggerButton/>
                  )}
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/reasoning')} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending || !!jsonError}>
                        {isPending ? "Saving..." : isEditing ? "Save Changes" : `Create Set`}
                    </Button>
                </div>
            </CardFooter>
        </form>
        </Form>
    </Card>
  );
}

    