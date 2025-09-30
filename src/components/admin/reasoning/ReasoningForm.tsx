
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
import { useTransition, useState, useEffect } from "react";
import { upsertReasoningSet } from "@/lib/data";
import type { ReasoningMCQ, ReasoningSet, ReasoningOption } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Trash2, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const singleMcqObjectSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Question text is required."),
  imageUrl: z.string().url().optional().or(z.literal('')),
  options: z.array(z.object({
    text: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
  })).min(2, "At least two options are required.").refine(options => options.some(opt => opt.text || opt.imageUrl), { message: "At least one option must have text or an image." }),
  correctOptionIndex: z.number().min(0, "You must select a correct answer."),
});

const formSchema = z.object({
  name: z.string().min(1, "Set Name is required."),
  mcqs: z.array(singleMcqObjectSchema).min(1, "At least one question is required."),
});

interface ReasoningFormProps {
  set?: ReasoningSet; 
  children: React.ReactNode;
}

const defaultMcqValue: Omit<ReasoningMCQ, 'id'> = { question: "", imageUrl: "", options: [{text: ""}, {text: ""}], correctOptionIndex: -1 };

export function ReasoningForm({ set, children }: ReasoningFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!set;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mcqs: [defaultMcqValue],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "mcqs",
  });

  useEffect(() => {
    if (isOpen) {
      const initialValues = {
        name: isEditing && set ? set.name : `Reasoning Set - ${new Date().toLocaleDateString()}`,
        mcqs: isEditing && set ? set.mcqs : [defaultMcqValue]
      };
      form.reset(initialValues);
    }
  }, [isOpen, set, isEditing, form]);

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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Reasoning Set' : 'Add New Reasoning Set'}</DialogTitle>
          <DialogDescription>
             Create a set of reasoning questions. You can add images to questions and options.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
           <form id="reasoning-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto -mx-6 px-6">
               <div className="py-4">
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
                  <h3 className="text-lg font-semibold border-t pt-4 mt-6">Questions</h3>
                  <ScrollArea className="h-[60vh] pr-4">
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
                                          Click 'Mark' to set the correct answer. You can provide text, an image URL, or both for each option.
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
           </form>
        </Form>
        <DialogFooter className="pt-6 border-t">
            <Button type="submit" form="reasoning-form" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Save Changes" : `Create Set`}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
