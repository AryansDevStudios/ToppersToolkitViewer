

"use client";

import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { upsertSubSubject } from "@/lib/data";
import { SubSubject } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { iconMap, iconNames } from "@/lib/iconMap";

const formSchema = z.object({
  name: z.string().min(1, { message: "Sub-subject name is required." }),
  icon: z.string().optional(),
});

interface SubSubjectFormProps {
  subjectId: string;
  subSubject?: SubSubject;
  trigger?: React.ReactNode;
}

export function SubSubjectForm({ subjectId, subSubject, trigger }: SubSubjectFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!subSubject;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subSubject?.name || "",
      icon: subSubject?.icon || "",
    },
  });

  const resetForm = () => {
    form.reset({ name: subSubject?.name || "", icon: subSubject?.icon || "" });
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await upsertSubSubject({
        subjectId,
        id: subSubject?.id,
        name: values.name.trim(),
        icon: values.icon,
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
          description: result.error || "Could not save the sub-subject.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Sub-Subject</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Sub-Subject' : 'Add New Sub-Subject'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Physics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon for the sub-subject" />
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
            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Sub-Subject"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
