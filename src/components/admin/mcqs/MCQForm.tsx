
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
import { upsertMCQ } from "@/lib/data";
import type { MCQ } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Trash2 } from "lucide-react";

const optionSchema = z.object({
  text: z.string().min(1, "Option text cannot be empty"),
});

const formSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters."),
  options: z.array(z.string()).min(2, "At least two options are required.").refine(
    (options) => options.every(opt => opt.trim().length > 0),
    { message: "All options must have text." }
  ),
  correctOptionIndex: z.number().min(0, "You must select a correct answer."),
});

interface MCQFormProps {
  subjectId: string;
  subSubjectId: string;
  chapterId: string;
  mcq?: MCQ;
  children: React.ReactNode;
}

export function MCQForm({ subjectId, subSubjectId, chapterId, mcq, children }: MCQFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!mcq;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      options: ["", ""],
      correctOptionIndex: -1,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });
  
  useEffect(() => {
    if (isOpen) {
        const defaultValues = {
            question: mcq?.question || "",
            options: mcq?.options && mcq.options.length > 0 ? mcq.options : ["", ""],
            correctOptionIndex: mcq?.correctOptionIndex ?? -1,
        };
        form.reset(defaultValues);
    }
  }, [isOpen, mcq, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await upsertMCQ({
        subjectId,
        subSubjectId,
        chapterId,
        mcqId: mcq?.id,
        ...values,
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
          description: result.error || "Could not save the MCQ.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit MCQ' : 'Add New MCQ'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
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
                 <div className="space-y-3">
                    {fields.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`options.${index}`}
                            render={({ field: optionField }) => (
                                <FormItem>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        type="button"
                                        variant={form.watch('correctOptionIndex') === index ? 'default' : 'outline'}
                                        onClick={() => form.setValue('correctOptionIndex', index, { shouldValidate: true })}
                                        className="h-10 w-24 shrink-0"
                                    >
                                        {form.watch('correctOptionIndex') === index ? 'Correct' : 'Mark'}
                                    </Button>
                                    <FormControl>
                                        <Input {...optionField} placeholder={`Option ${index + 1}`} />
                                    </FormControl>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                 </div>
                  {form.formState.errors.options && <FormMessage>{form.formState.errors.options.message}</FormMessage>}
                  {form.formState.errors.correctOptionIndex && <FormMessage className="mt-2">{form.formState.errors.correctOptionIndex.message}</FormMessage>}

                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => append("")}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                </Button>
            </div>

            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create MCQ"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
