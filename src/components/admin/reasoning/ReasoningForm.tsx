
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { upsertReasoningSet } from "@/lib/data";
import type { ReasoningMCQ, ReasoningSet } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Trash2, Image as ImageIcon, Copy, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  children: React.ReactNode;
}

const defaultMcqValue: Omit<ReasoningMCQ, 'id'> = { 
  question: "", 
  imageUrl: "", 
  options: [{text: ""}, {text: ""}, {text: ""}, {text: ""}], 
  correctOptionIndex: -1 
};

const demoJson = JSON.stringify([
  {
    "question": "Which pattern is next in the sequence?",
    "imageUrl": "https://picsum.photos/seed/seq1/400/200",
    "options": [
      { "imageUrl": "https://picsum.photos/seed/opt1/150/150" },
      { "imageUrl": "https://picsum.photos/seed/opt2/150/150" },
      { "imageUrl": "https://picsum.photos/seed/opt3/150/150" },
      { "imageUrl": "https://picsum.photos/seed/opt4/150/150" }
    ],
    "correctOptionIndex": 2
  }
], null, 2);

export function ReasoningForm({ set, children }: ReasoningFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const isEditing = !!set;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mcqs: [defaultMcqValue],
    },
    mode: "onChange",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "mcqs",
  });
  
  const watchedMcqs = form.watch('mcqs');
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

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newJson = e.target.value;
      setJsonText(newJson);
      updateFormFromJson(newJson);
  }

  useEffect(() => {
    if (isOpen) {
      const initialValues = {
        name: isEditing && set ? set.name : `Reasoning Set - ${new Date().toLocaleDateString()}`,
        mcqs: isEditing && set ? set.mcqs : [defaultMcqValue]
      };
      form.reset(initialValues);
      setJsonText(JSON.stringify(initialValues.mcqs, null, 2));
      setJsonError(null);
    }
  }, [isOpen, set, isEditing, form]);
  
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
        setIsOpen(false);
        router.refresh();
      } else {
        toast({ title: "Operation Failed", description: result.error || "Could not save the set.", variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Reasoning Set' : 'Add New Reasoning Set'}</DialogTitle>
          <DialogDescription>
             Create a set of reasoning questions. Use the form, or paste valid JSON.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
           <form id="reasoning-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto -mx-6 px-6">
               <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
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
                      <h3 className="text-lg font-semibold border-t pt-4">Questions</h3>
                      <ScrollArea className="h-[55vh] pr-4">
                          <div className="space-y-6 mt-4">
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
                                                  <Textarea placeholder="Which shape comes next in the sequence?" {...field} />
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
                                              <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Question Image URL (Optional)</FormLabel>
                                              <FormControl>
                                                  <Input placeholder="https://example.com/image.png" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                              </FormItem>
                                          )}
                                      />
                                      <div>
                                          <FormLabel>Options</FormLabel>
                                          <FormDescription className="text-xs mb-2">
                                              Click 'Mark' to set the correct answer. You can provide text, an image URL, or both.
                                          </FormDescription>
                                          <div className="space-y-3">
                                          {mcqField.options.map((_, optionIndex) => (
                                              <div key={`${mcqField.id}-option-${optionIndex}`} className="p-3 border rounded-md bg-muted/50 space-y-2">
                                                  <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={form.watch(`mcqs.${mcqIndex}.correctOptionIndex`) === optionIndex ? 'default' : 'outline'}
                                                        onClick={() => form.setValue(`mcqs.${mcqIndex}.correctOptionIndex`, optionIndex, { shouldValidate: true })}
                                                        className="h-10 w-24 shrink-0"
                                                    >
                                                        {form.watch(`mcqs.${mcqIndex}.correctOptionIndex`) === optionIndex ? 'Correct' : 'Mark'}
                                                    </Button>
                                                    <FormField
                                                      control={form.control}
                                                      name={`mcqs.${mcqIndex}.options.${optionIndex}.text`}
                                                      render={({ field: optionField }) => (
                                                        <FormControl>
                                                            <Input {...optionField} placeholder={`Option ${optionIndex + 1} Text`} />
                                                        </FormControl>
                                                      )}
                                                    />
                                                  </div>
                                                   <FormField
                                                      control={form.control}
                                                      name={`mcqs.${mcqIndex}.options.${optionIndex}.imageUrl`}
                                                      render={({ field: optionField }) => (
                                                        <FormControl>
                                                            <Input {...optionField} placeholder={`Option ${optionIndex + 1} Image URL`} />
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
                                  <PlusCircle className="mr-2 h-4 w-4" /> Add Another Question
                              </Button>
                          </div>
                      </ScrollArea>
                  </div>
                  <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">JSON Editor for Questions</h3>
                             <Button type="button" variant="outline" size="sm" onClick={handleCopyDemo}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Demo
                            </Button>
                        </div>
                        <div className="flex-1 flex flex-col relative min-h-[400px]">
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
           </form>
        </Form>
        <DialogFooter className="pt-6 border-t">
            <Button type="submit" form="reasoning-form" disabled={isPending || !!jsonError}>
                {isPending ? "Saving..." : isEditing ? "Save Changes" : `Create Set`}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
