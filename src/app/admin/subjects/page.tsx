
import { getSubjects } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle, Library, Folder, FileText } from "lucide-react";
import { SubjectForm } from "@/components/admin/subjects/SubjectForm";
import { SubSubjectForm } from "@/components/admin/subjects/SubSubjectForm";
import { ChapterForm } from "@/components/admin/subjects/ChapterForm";
import { DeleteDialog } from "@/components/admin/subjects/DeleteDialog";
import { iconMap } from "@/lib/iconMap";

export default async function AdminSubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Subjects Management</h1>
          <p className="text-muted-foreground">
            Organize the curriculum structure of your platform.
          </p>
        </div>
        <SubjectForm trigger={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        } />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Curriculum Structure</CardTitle>
          <CardDescription>Manage subjects, sub-subjects, and chapters.</CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Library className="h-12 w-12 mx-auto mb-4" />
              <p className="mb-4">No subjects created yet.</p>
              <SubjectForm trigger={<Button>Create Your First Subject</Button>} />
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {subjects.map((subject) => {
                const SubjectIcon = iconMap[subject.icon as string] || Library;
                return (
                  <AccordionItem value={subject.id} key={subject.id}>
                    <AccordionTrigger className="text-xl font-bold hover:no-underline">
                      <div className="flex items-center gap-3">
                         <SubjectIcon className="h-6 w-6 text-primary" />
                        {subject.name}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 border-l-2 border-primary/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                           <h3 className="text-lg font-semibold">Sub-Subjects</h3>
                           <SubSubjectForm subjectId={subject.id} trigger={
                            <Button variant="outline" size="sm">
                              <PlusCircle className="mr-2 h-4 w-4" /> Add Sub-Subject
                            </Button>
                           } />
                        </div>
                        <div className="flex items-center gap-2">
                            <SubjectForm subject={subject} />
                            <DeleteDialog type="Subject" subjectId={subject.id} />
                        </div>
                      </div>

                      {subject.subSubjects && subject.subSubjects.length > 0 ? (
                        <Accordion type="multiple" className="w-full">
                           {subject.subSubjects.map((subSubject) => (
                             <AccordionItem value={subSubject.id} key={subSubject.id} className="border-b-0">
                               <AccordionTrigger className="text-lg font-semibold hover:no-underline rounded-md px-4 hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <Folder className="h-5 w-5 text-primary/80" />
                                  {subSubject.name}
                                </div>
                               </AccordionTrigger>
                               <AccordionContent className="pl-6 border-l-2 border-primary/20">
                                  <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-4">
                                       <h4 className="text-md font-semibold">Chapters</h4>
                                       <ChapterForm subjectId={subject.id} subSubjectId={subSubject.id} trigger={
                                          <Button variant="outline" size="sm">
                                              <PlusCircle className="mr-2 h-4 w-4" /> Add Chapter
                                          </Button>
                                       } />
                                     </div>
                                      <div className="flex items-center gap-2">
                                          <SubSubjectForm subjectId={subject.id} subSubject={subSubject} />
                                          <DeleteDialog type="Sub-Subject" subjectId={subject.id} subSubjectId={subSubject.id} />
                                      </div>
                                  </div>
                                  
                                  {subSubject.chapters && subSubject.chapters.length > 0 ? (
                                    <ul className="space-y-2">
                                        {subSubject.chapters.map(chapter => (
                                          <li key={chapter.id} className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50">
                                             <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-primary/70" />
                                                <span>{chapter.name}</span>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                <ChapterForm subjectId={subject.id} subSubjectId={subSubject.id} chapter={chapter} />
                                                <DeleteDialog type="Chapter" subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id} />
                                            </div>
                                          </li>
                                        ))}
                                    </ul>
                                  ) : <p className="text-sm text-muted-foreground italic mt-2">No chapters yet.</p>}

                               </AccordionContent>
                             </AccordionItem>
                           ))}
                        </Accordion>
                      ) : <p className="text-sm text-muted-foreground italic mt-2">No sub-subjects yet.</p>}
                      
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
