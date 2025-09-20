
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
import { upsertMCQs, updateMCQ } from "@/lib/data";
import type { MCQ } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Copy } from "lucide-react";

// Schema for a single MCQ object, used for both creation and editing validation
const singleMcqObjectSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters long."),
  options: z.array(z.string().min(1, "Option text cannot be empty.")).min(2, "At least two options are required."),
  correctOptionIndex: z.number().min(0, "You must select a correct answer by clicking 'Mark'.").nonnegative(),
});

// Base schema for the form
const createMcqFormSchema = z.discriminatedUnion("activeTab", [
    z.object({
        activeTab: z.literal("manual"),
        mcqs: z.array(singleMcqObjectSchema).min(1, "Please add at least one question."),
        jsonInput: z.string().optional(),
    }),
    z.object({
        activeTab: z.literal("json"),
        jsonInput: z.string().min(1, "JSON input cannot be empty.").refine(
            (val) => {
                try {
                    const parsed = JSON.parse(val);
                    z.array(singleMcqObjectSchema).parse(parsed);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            { message: "Input must be a valid JSON array of MCQs." }
        ),
        mcqs: z.array(singleMcqObjectSchema).optional(),
    }),
]);


// Schema for the EDIT form (a single MCQ)
const editMcqSchema = singleMcqObjectSchema;

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

interface MCQFormProps {
  subjectId: string;
  subSubjectId: string;
  chapterId: string;
  mcq?: MCQ; // If mcq is provided, we are in edit mode
  children: React.ReactNode;
}

const defaultMcqValue = { question: "", options: ["", "", "", ""], correctOptionIndex: -1 };

export function MCQForm({ subjectId, subSubjectId, chapterId, mcq, children }: MCQFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!mcq;

  // Form for CREATING new MCQs
  const createForm = useForm<z.infer<typeof createMcqFormSchema>>({
    resolver: zodResolver(createMcqFormSchema),
    defaultValues: {
      activeTab: "manual",
      mcqs: [defaultMcqValue],
      jsonInput: "",
    },
    mode: "onSubmit",
  });

  // Form for EDITING a single MCQ
  const editForm = useForm<z.infer<typeof editMcqSchema>>({
    resolver: zodResolver(editMcqSchema),
  });

  // Get the correct form instance based on the mode
  const form = isEditing ? editForm : createForm;

  const { fields: mcqFields, append: appendMcq, remove: removeMcq } = useFieldArray({
    control: createForm.control,
    name: "mcqs",
  });

  const activeTab = createForm.watch("activeTab");

  useEffect(() => {
    if (isOpen) {
      if (isEditing && mcq) {
        // Reset the EDIT form with the MCQ data
        editForm.reset({
          question: mcq.question,
          options: mcq.options.length >= 4 ? mcq.options : [...mcq.options, ...Array(4 - mcq.options.length).fill('')],
          correctOptionIndex: mcq.correctOptionIndex,
        });
      } else {
        // Reset the CREATE form to its default state
        createForm.reset({
          activeTab: "manual",
          mcqs: [defaultMcqValue],
          jsonInput: "",
        });
      }
    }
  }, [isOpen, mcq, isEditing, createForm, editForm]);


  // Handler for CREATING new MCQs
  function onCreateSubmit(values: z.infer<typeof createMcqFormSchema>) {
    console.log("onCreateSubmit called with values:", values);
    startTransition(async () => {
        let mcqsToUpsert: Omit<MCQ, 'id'>[] = [];

        if (values.activeTab === 'json' && values.jsonInput) {
             console.log("Processing JSON input.");
            try {
                const parsedJson = JSON.parse(values.jsonInput);
                const validationResult = z.array(singleMcqObjectSchema).safeParse(parsedJson);
                if (!validationResult.success) {
                    console.error("JSON validation failed on submit:", validationResult.error);
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
                console.error("JSON parsing failed on submit:", e);
                toast({ title: "Invalid JSON", description: "The provided text is not valid JSON.", variant: "destructive" });
                return;
            }
        } else if (values.activeTab === 'manual' && values.mcqs) {
             console.log("Processing manual MCQ input.");
             mcqsToUpsert = values.mcqs;
        }

        if (mcqsToUpsert.length === 0) {
            console.log("No questions to submit.");
            toast({ title: "No questions to submit", description: "Please add at least one question.", variant: "destructive" });
            return;
        }

      console.log("Submitting MCQs to backend:", mcqsToUpsert);
      const result = await upsertMCQs({
        subjectId,
        subSubjectId,
        chapterId,
        mcqs: mcqsToUpsert,
      });
      console.log("Backend response:", result);

      if (result.success) {
        toast({ title: "Success", description: result.message });
        setIsOpen(false);
        router.refresh();
      } else {
        toast({ title: "Operation Failed", description: result.error || "Could not save the MCQs.", variant: "destructive" });
      }
    });
  }

  // Handler for EDITING an existing MCQ
  function onEditSubmit(values: z.infer<typeof editMcqSchema>) {
      if (!mcq?.id) return;
      
      startTransition(async () => {
          const result = await updateMCQ({
              id: mcq.id,
              subjectId,
              subSubjectId,
              chapterId,
              ...values,
          });

          if (result.success) {
              toast({ title: "Success", description: result.message });
              setIsOpen(false);
              router.refresh();
          } else {
              toast({ title: "Update Failed", description: result.error || "Could not update the MCQ.", variant: "destructive" });
          }
      });
  }

  const handleCopyDemo = () => {
    navigator.clipboard.writeText(jsonPlaceholder);
    toast({ title: "Copied!", description: "Demo JSON copied to clipboard." });
  }

  const handleTabChange = (value: string) => {
      if (value === 'manual' || value === 'json') {
          createForm.setValue("activeTab", value);
          // Clear errors when switching tabs
          createForm.clearErrors();
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit MCQ' : 'Add New MCQs'}</DialogTitle>
           <DialogDescription>
            {isEditing ? 'Modify the question and its options below.' : 'Use manual entry to add questions one-by-one, or use JSON upload for bulk creation.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
           <form id="mcq-form" onSubmit={isEditing ? editForm.handleSubmit(onEditSubmit) : createForm.handleSubmit(onCreateSubmit, (errors) => console.log("Form validation errors:", errors))} className="flex-1 flex flex-col min-h-0">
                {isEditing ? (
                    // EDITING UI
                    <div className="overflow-y-auto -mx-6 px-6 py-4 border-y flex-1">
                        <div className="space-y-4">
                             <FormField
                                control={editForm.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Question</FormLabel>
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
                                <MCQOptionsArray mcqIndex={0} isEditing={true} />
                                {editForm.formState.errors?.correctOptionIndex && (
                                    <p className="text-sm font-medium text-destructive mt-2">{editForm.formState.errors.correctOptionIndex?.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // CREATING UI
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                            <TabsTrigger value="json">JSON Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="manual" className="flex-1 overflow-y-auto -mx-6 px-6 py-4 border-y">
                           <div className="space-y-6">
                                {mcqFields.map((mcqField, mcqIndex) => (
                                    <div key={mcqField.id} className="p-4 border rounded-lg space-y-4 relative bg-card">
                                    {mcqFields.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeMcq(mcqIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <FormField
                                        control={createForm.control}
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
                                        <MCQOptionsArray mcqIndex={mcqIndex} isEditing={false} />
                                         {createForm.formState.errors?.mcqs?.[mcqIndex]?.correctOptionIndex && (
                                            <p className="text-sm font-medium text-destructive mt-2">{createForm.formState.errors.mcqs[mcqIndex]?.correctOptionIndex?.message}</p>
                                        )}
                                    </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendMcq(defaultMcqValue)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Question
                                </Button>
                           </div>
                        </TabsContent>
                        <TabsContent value="json" className="flex-1 flex flex-col min-h-0 -mx-6 px-6 py-4 border-y">
                             <FormField
                                control={createForm.control}
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
                                        <Textarea placeholder={jsonPlaceholder} className="h-full resize-none font-mono text-xs" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>
                    </Tabs>
                )}
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

// Reusable component for handling the options array
function MCQOptionsArray({ mcqIndex, isEditing }: { mcqIndex: number, isEditing: boolean }) {
  const { control, watch, setValue, formState: { errors } } = useFormContext(); // Gets context from the parent <Form>
  
  const fieldNamePrefix = isEditing ? '' : `mcqs.${mcqIndex}.`;
  
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `${fieldNamePrefix}options`,
  });

  const optionsError = isEditing 
    ? errors?.options?.root 
    : errors?.mcqs?.[mcqIndex]?.options?.root;

  return (
    <div className="space-y-3">
        {fields.map((field, optionIndex) => (
            <FormField
                key={field.id}
                control={control}
                name={`${fieldNamePrefix}options.${optionIndex}`}
                render={({ field: optionField }) => (
                    <FormItem>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={watch(`${fieldNamePrefix}correctOptionIndex`) === optionIndex ? 'default' : 'outline'}
                            onClick={() => setValue(`${fieldNamePrefix}correctOptionIndex`, optionIndex, { shouldValidate: true })}
                            className="h-10 w-24 shrink-0"
                        >
                            {watch(`${fieldNamePrefix}correctOptionIndex`) === optionIndex ? 'Correct' : 'Mark'}
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
