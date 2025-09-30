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
import { upsertCurrentAffairsSet } from "@/lib/data";
import type { MCQ, CurrentAffairsSet } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const singleMcqObjectSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(3, "Question must be at least 3 characters long."),
  options: z.array(z.string().min(1, "Option text cannot be empty.")).min(2, "At least two options are required."),
  correctOptionIndex: z.number().min(0, "You must select a correct answer by clicking 'Mark'."),
});

const formSchema = z.object({
  name: z.string().min(1, "Set Name is required."),
  mcqs: z.array(singleMcqObjectSchema).min(1, "At least one MCQ is required."),
});

interface CurrentAffairsFormProps {
  set?: CurrentAffairsSet; 
  children: React.ReactNode;
}

const defaultMcqValue: Omit<MCQ, 'id'> = { question: "", options: ["", "", "", ""], correctOptionIndex: -1 };

export function CurrentAffairsForm({ set, children }: CurrentAffairsFormProps) {
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
        name: isEditing && set ? set.name : `Current Affairs - ${new Date().toLocaleDateString()}`,
        mcqs: isEditing && set ? set.mcqs : [defaultMcqValue]
      };
      form.reset(initialValues);
    }
  }, [isOpen, set, isEditing, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await upsertCurrentAffairsSet({
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Set' : 'Add New Set'}</DialogTitle>
          <DialogDescription>
             Create a new set of Current Affairs questions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
                <div className="space-y-4 py-4 flex-1 overflow-y-auto pr-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Set Name</FormLabel>
                            <FormControl>
                                <Input placeholder="E.g., Weekly Quiz - 25th July" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <h3 className="text-lg font-semibold border-t pt-4">Questions</h3>
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
                                            <Textarea placeholder="Who won the recent election?" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div>
                                    <FormLabel>Options</FormLabel>
                                    <FormDescription className="text-xs mb-2">
                                        Click 'Mark' to set the correct answer.
                                    </FormDescription>
                                    <div className="space-y-3">
                                    {mcqField.options.map((_, optionIndex) => (
                                        <FormField
                                            key={`${mcqField.id}-option-${optionIndex}`}
                                            control={form.control}
                                            name={`mcqs.${mcqIndex}.options.${optionIndex}`}
                                            render={({ field: optionField }) => (
                                                <FormItem>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={form.watch(`mcqs.${mcqIndex}.correctOptionIndex`) === optionIndex ? 'default' : 'outline'}
                                                        onClick={() => form.setValue(`mcqs.${mcqIndex}.correctOptionIndex`, optionIndex, { shouldValidate: true })}
                                                        className="h-10 w-24 shrink-0"
                                                    >
                                                        {form.watch(`mcqs.${mcqIndex}.correctOptionIndex`) === optionIndex ? 'Correct' : 'Mark'}
                                                    </Button>
                                                    <FormControl>
                                                        <Input {...optionField} placeholder={`Option ${optionIndex + 1}`} />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                </div>
                <DialogFooter className="pt-6 border-t">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : isEditing ? "Save Changes" : `Create Set`}
                    </Button>
                </DialogFooter>
           </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
