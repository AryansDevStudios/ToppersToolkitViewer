
"use client";

import { useForm, useFieldArray, useFormContext } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useCallback } from "react";
import { upsertMCQs, updateMCQ } from "@/lib/data";
import type { MCQ } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Trash2, Copy, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { debounce } from "lodash";
import { cn } from "@/lib/utils";

const singleMcqObjectSchema = z.object({
  question: z.string().min(1, "Question cannot be empty."),
  options: z.array(z.string().min(1, "Option text cannot be empty.")).min(2, "At least two options are required."),
  correctOptionIndex: z.number().min(0, "You must select a correct answer.").nonnegative("A correct option must be selected."),
});

const formSchema = z.object({
    mcqs: z.array(singleMcqObjectSchema),
});

interface MCQFormProps {
  subjectId: string;
  subSubjectId: string;
  chapterId: string;
  mcq?: MCQ; 
  children: React.ReactNode;
}

const defaultMcqValue = { question: "", options: ["", "", "", ""], correctOptionIndex: -1 };

export function MCQForm({ subjectId, subSubjectId, chapterId, mcq, children }: MCQFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const isEditing = !!mcq;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mcqs: isEditing && mcq ? [mcq] : [defaultMcqValue],
    },
    mode: "onChange",
  });

  const { fields: mcqFields, append: appendMcq, remove: removeMcq, replace: replaceMcqs } = useFieldArray({
    control: form.control,
    name: "mcqs",
  });

  const mcqsValue = form.watch('mcqs');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(mcqsValue, null, 2));

  // Debounced function to update form from JSON
  const debouncedUpdateForm = useCallback(debounce((newJson: string) => {
    try {
        const parsed = JSON.parse(newJson);
        const validationResult = z.array(singleMcqObjectSchema).safeParse(parsed);
        if(validationResult.success) {
            replaceMcqs(validationResult.data);
            setJsonError(null);
        } else {
            setJsonError("JSON does not match the required format.");
        }
    } catch (e) {
      setJsonError("Invalid JSON syntax.");
    }
  }, 500), [replaceMcqs]);
  
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newJson = e.target.value;
      setJsonText(newJson);
      debouncedUpdateForm(newJson);
  }

  // Effect to sync Form state -> JSON state
  useEffect(() => {
    // Only update JSON text if the user is not currently editing it.
    if (!isEditingJson) {
        setJsonText(JSON.stringify(mcqsValue, null, 2));
    }
  }, [mcqsValue, isEditingJson]);

  useEffect(() => {
    if (isOpen) {
      const initialValues = isEditing && mcq ? [mcq] : [defaultMcqValue];
      form.reset({ mcqs: initialValues });
      setJsonText(JSON.stringify(initialValues, null, 2));
      setJsonError(null);
    }
  }, [isOpen, mcq, isEditing, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        let result;
        if (isEditing) {
            result = await updateMCQ({
                id: mcq!.id,
                subjectId,
                subSubjectId,
                chapterId,
                ...values.mcqs[0],
            });
        } else {
             result = await upsertMCQs({
                subjectId,
                subSubjectId,
                chapterId,
                mcqs: values.mcqs,
            });
        }

      if (result.success) {
        toast({ title: "Success", description: result.message });
        setIsOpen(false);
        router.refresh();
      } else {
        toast({ title: "Operation Failed", description: result.error || "Could not save the MCQs.", variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit MCQ' : 'Add New MCQs'}</DialogTitle>
          <DialogDescription>
             {isEditing ? 'Modify the question and its options below.' : 'Add questions manually or paste valid JSON. Both views are synchronized.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
           <form id="mcq-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 py-4">
                    {/* Manual Entry Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold">Manual Editor</h3>
                        <ScrollArea className="flex-1 h-0 pr-4">
                           <div className="space-y-6">
                                {mcqFields.map((mcqField, mcqIndex) => (
                                    <div key={mcqField.id} className="p-4 border rounded-lg space-y-4 relative bg-card">
                                    {!isEditing && mcqFields.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeMcq(mcqIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <FormField
                                        control={form.control}
                                        name={`mcqs.${mcqIndex}.question`}
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Question {mcqIndex + 1}</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="What is the powerhouse of the cell?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                    <div>
                                        <FormLabel>Options</FormLabel>
                                        <FormDescription className="text-xs mb-2">
                                            Click on an option to mark it as the correct answer.
                                        </FormDescription>
                                        <MCQOptionsArray mcqIndex={mcqIndex} />
                                         {form.formState.errors?.mcqs?.[mcqIndex]?.correctOptionIndex && (
                                            <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.mcqs[mcqIndex]?.correctOptionIndex?.message}</p>
                                        )}
                                    </div>
                                    </div>
                                ))}
                                {!isEditing && (
                                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendMcq(defaultMcqValue)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Question
                                    </Button>
                                )}
                           </div>
                        </ScrollArea>
                    </div>

                    {/* JSON Entry Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold">JSON Editor</h3>
                        <div className="flex-1 flex flex-col relative">
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
                </div>

                <DialogFooter className="pt-6 border-t">
                    <Button type="submit" form="mcq-form" disabled={isPending || !!jsonError}>
                        {isPending ? "Saving..." : isEditing ? "Save Changes" : `Create ${mcqFields.length} MCQ(s)`}
                    </Button>
                </DialogFooter>
           </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function MCQOptionsArray({ mcqIndex }: { mcqIndex: number }) {
  const { control, watch, setValue, formState: { errors } } = useFormContext<z.infer<typeof formSchema>>();
  
  const fieldNamePrefix = `mcqs.${mcqIndex}`;
  
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `${fieldNamePrefix}.options`,
  });

  const optionsError = errors?.mcqs?.[mcqIndex]?.options?.root;

  return (
    <div className="space-y-3">
        {fields.map((field, optionIndex) => (
            <FormField
                key={field.id}
                control={control}
                name={`${fieldNamePrefix}.options.${optionIndex}`}
                render={({ field: optionField }) => (
                    <FormItem>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={watch(`${fieldNamePrefix}.correctOptionIndex`) === optionIndex ? 'default' : 'outline'}
                            onClick={() => setValue(`${fieldNamePrefix}.correctOptionIndex`, optionIndex, { shouldValidate: true })}
                            className="h-10 w-24 shrink-0"
                        >
                            {watch(`${fieldNamePrefix}.correctOptionIndex`) === optionIndex ? 'Correct' : 'Mark'}
                        </Button>
                        <FormControl>
                            <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                        </FormControl>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(optionIndex)} disabled={fields.length <= 2}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
            />
        ))}
        {optionsError && <FormMessage>{optionsError.message}</FormMessage>}
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => append("")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
        </Button>
    </div>
  )
}

    