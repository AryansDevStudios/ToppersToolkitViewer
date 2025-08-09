import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getSubjects } from "@/lib/data";

export default async function AdminSubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">
            Subject Management
          </h1>
          <p className="text-muted-foreground">
            Organize subjects, sub-subjects, and chapters.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </header>

      <Accordion type="multiple" className="w-full">
        {subjects.map((subject) => (
          <AccordionItem value={subject.id} key={subject.id}>
            <AccordionTrigger className="text-lg font-headline hover:no-underline">
              {subject.name}
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <Accordion type="multiple" className="w-full">
                {subject.subSubjects.map((subSubject) => (
                  <AccordionItem value={subSubject.id} key={subSubject.id}>
                    <AccordionTrigger>{subSubject.name}</AccordionTrigger>
                    <AccordionContent className="pl-4">
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {subSubject.chapters.map((chapter) => (
                          <li key={chapter.id}>{chapter.name}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
