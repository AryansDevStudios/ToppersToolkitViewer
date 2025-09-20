
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
import { useTransition, useState, useEffect } from "react";
import { upsertMCQs } from "@/lib/data";
import type { MCQ } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Copy } from "lucide-react";

const singleMCQSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters."),
  options: z.array(z.string()).min(2, "At least two options are required.").refine(
    (options) => options.every(opt => opt.trim().length > 0),
    { message: "All options must have text." }
  ),
  correctOptionIndex: z.number().min(0, "You must select a correct answer."),
});

const jsonPlaceholder = `[
  {
    "question": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "correctOptionIndex": 0
  },
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctOptionIndex": 1
  }
]`;

const formSchema = z.object({
  mcqs: z.array(singleMCQSchema),
  jsonInput: z.string().optional(),
  activeTab: z.string().default("manual"),
});


interface MCQFormProps {
  subjectId: string;
  subSubjectId: string;
  chapterId: string;
  mcq?: MCQ; // Editing is now for a single MCQ, not multiple
  children: React.ReactNode;
}

const defaultMcqValue = { question: "", options: ["", "", "", ""], correctOptionIndex: -1 };

export function MCQForm({ subjectId, subSubjectId, chapterId, mcq, children }: MCQFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!mcq;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mcqs: [defaultMcqValue],
      jsonInput: "",
      activeTab: "manual",
    }
  });

  const { fields: mcqFields, append: appendMcq, remove: removeMcq } = useFieldArray({
    control: form.control,
    name: "mcqs",
  });

  const activeTab = form.watch("activeTab");
  
  useEffect(() => {
    if (isOpen) {
      if (isEditing && mcq) {
        form.reset({
          mcqs: [{
            question: mcq.question,
            options: mcq.options.length >= 4 ? mcq.options : [...mcq.options, ...Array(4 - mcq.options.length).fill('')],
            correctOptionIndex: mcq.correctOptionIndex,
          }],
          jsonInput: "",
          activeTab: "manual"
        });
      } else {
        form.reset({
          mcqs: [defaultMcqValue],
          jsonInput: "",
          activeTab: "manual"
        });
      }
    }
  }, [isOpen, mcq, form, isEditing]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        let mcqsToUpsert: Omit<MCQ, 'id'>[] = [];
        
        if (activeTab === 'json' && values.jsonInput) {
            try {
                const parsedJson = JSON.parse(values.jsonInput);
                const validationResult = z.array(singleMCQSchema).safeParse(parsedJson);
                if (!validationResult.success) {
                    toast({
                        title: "JSON Validation Failed",
                        description: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n'),
                        variant: "destructive",
                        duration: 10000,
                    });
                    return;
                }
                mcqsToUpsert = validationResult.data;
            } catch (e) {
                toast({ title: "Invalid JSON", description: "The provided text is not valid JSON.", variant: "destructive" });
                return;
            }
        } else {
             const manualValidationResult = z.array(singleMCQSchema).min(1).safeParse(values.mcqs);
              if (!manualValidationResult.success) {
                    toast({
                        title: "Form Validation Failed",
                        description: manualValidationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n'),
                        variant: "destructive",
                        duration: 10000,
                    });
                    return;
                }
            mcqsToUpsert = values.mcqs;
        }
        
        if (mcqsToUpsert.length === 0) {
            toast({ title: "No questions to submit", description: "Please add at least one question.", variant: "destructive" });
            return;
        }

      const result = await upsertMCQs({
        subjectId,
        subSubjectId,
        chapterId,
        mcqs: mcqsToUpsert.map((m) => ({
            id: isEditing && activeTab === 'manual' ? mcq?.id : undefined,
            ...m,
        })),
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Operation Failed",
          description: result.error || "Could not save the MCQs.",
          variant: "destructive",
        });
      }
    });
  }

  const handleCopyDemo = () => {
    navigator.clipboard.writeText(jsonPlaceholder);
    toast({
        title: "Copied!",
        description: "Demo JSON copied to clipboard.",
    });
  }

  const handleTabChange = (value: string) => {
      form.setValue("activeTab", value, { shouldValidate: true });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit MCQ' : 'Add New MCQs'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
           <form id="mcq-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
                    {!isEditing && (
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                            <TabsTrigger value="json">JSON Upload</TabsTrigger>
                        </TabsList>
                    )}
                    <TabsContent value="manual" className="flex-1 overflow-y-auto -mx-6 px-6 py-4 border-y">
                       <div className="space-y-6">
                            {mcqFields.map((mcqField, mcqIndex) => (
                                <div key={mcqField.id} className="p-4 border rounded-lg space-y-4 relative bg-card">
                                {!isEditing && mcqFields.length > 1 && (
                                    <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={() => removeMcq(mcqIndex)}
                                    >
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
                    </TabsContent>
                    <TabsContent value="json" className="flex-1 flex flex-col min-h-0 -mx-6 px-6 py-4 border-y">
                         <FormField
                            control={form.control}
                            name="jsonInput"
                            render={({ field }) => (
                                <FormItem className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <FormLabel>MCQ JSON</FormLabel>
                                            <FormDescription>Paste an array of MCQ objects.</FormDescription>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={handleCopyDemo}>
                                            <Copy className="mr-2 h-4 w-4" /> Copy Demo
                                        </Button>
                                    </div>
                                <FormControl className="flex-1 mt-2">
                                    <Textarea
                                    placeholder={jsonPlaceholder}
                                    className="h-full resize-none font-mono text-xs"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </Tabs>
                <DialogFooter className="pt-4">
                    <Button type="submit" form="mcq-form" disabled={isPending}>
                        {isPending ? "Saving..." : 
                         isEditing ? "Save Changes" :
                         activeTab === 'json' ? "Upload from JSON" :
                         `Create ${mcqFields.length} MCQ(s)`
                        }
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
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `mcqs.${mcqIndex}.options`,
  });

  return (
    <div className="space-y-3">
        {fields.map((field, optionIndex) => (
            <FormField
                key={field.id}
                control={control}
                name={`mcqs.${mcqIndex}.options.${optionIndex}`}
                render={({ field: optionField }) => (
                    <FormItem>
                    <div className="flex items-center gap-2">
                        <Button 
                            type="button"
                            variant={watch(`mcqs.${mcqIndex}.correctOptionIndex`) === optionIndex ? 'default' : 'outline'}
                            onClick={() => setValue(`mcqs.${mcqIndex}.correctOptionIndex`, optionIndex, { shouldValidate: true })}
                            className="h-10 w-24 shrink-0"
                        >
                            {watch(`mcqs.${mcqIndex}.correctOptionIndex`) === optionIndex ? 'Correct' : 'Mark'}
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
        {errors?.mcqs?.[mcqIndex]?.options?.root && <FormMessage>{errors.mcqs[mcqIndex]?.options?.root?.message}</FormMessage>}
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => append("")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
        </Button>
    </div>
  )
}
