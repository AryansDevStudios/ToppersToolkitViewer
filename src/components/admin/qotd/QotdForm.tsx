
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { upsertQuestionOfTheDay } from "@/lib/data";
import type { QuestionOfTheDay, QotdOption } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text cannot be empty"),
});

const formSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters."),
  options: z.array(optionSchema).min(2, "At least two options are required."),
  correctOptionId: z.string().min(1, "You must select a correct answer."),
  date: z.date({ required_error: "A date is required."}),
});

interface QotdFormProps {
  question?: QuestionOfTheDay;
  children: React.ReactNode;
}

export function QotdForm({ question, children }: QotdFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!question;

  const getInitialFormValues = () => ({
    question: question?.question || "",
    options: question?.options && question.options.length > 0 ? question.options : [{ id: uuidv4(), text: "" }, { id: uuidv4(), text: "" }],
    correctOptionId: question?.correctOptionId || "",
    date: question ? new Date(question.date) : new Date(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialFormValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset(getInitialFormValues());
    }
  }, [isOpen, question, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const questionData = {
          ...values,
          date: format(values.date, 'yyyy-MM-dd'), // Format date to string for Firestore
      };

      const result = await upsertQuestionOfTheDay({
        id: question?.id,
        ...questionData
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
          description: result.error || "Could not save the question.",
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
          <DialogTitle>{isEditing ? 'Edit Question' : 'Add New Question'}</DialogTitle>
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
                      <Input placeholder="What is the capital of France?" {...field} />
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
                            name={`options.${index}.text`}
                            render={({ field: optionField }) => (
                                <FormItem>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        type="button"
                                        variant={form.watch('correctOptionId') === field.id ? 'default' : 'outline'}
                                        onClick={() => form.setValue('correctOptionId', field.id, { shouldValidate: true })}
                                        className="h-10 w-24"
                                    >
                                        {form.watch('correctOptionId') === field.id ? 'Correct' : 'Mark'}
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
                  {form.formState.errors.correctOptionId && <FormMessage className="mt-2">{form.formState.errors.correctOptionId.message}</FormMessage>}

                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => append({ id: uuidv4(), text: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                </Button>
            </div>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date for Question</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Question"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
