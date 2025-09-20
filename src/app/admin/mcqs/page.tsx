
import { getSubjects } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BookCheck, Library, Folder, FileText, PlusCircle, Edit, Trash2 } from "lucide-react";
import { iconMap } from "@/lib/iconMap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MCQForm } from "@/components/admin/mcqs/MCQForm";
import { DeleteMCQDialog } from "@/components/admin/mcqs/DeleteMCQDialog";

export const revalidate = 0;

export default async function AdminMCQsPage() {
  const subjects = await getSubjects();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookCheck className="w-8 h-8 text-primary" />
            MCQs Management
        </h1>
        <p className="text-muted-foreground">
          Create, edit, and delete Multiple Choice Question sets for practice quizzes.
        </p>
      </header>

       {subjects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <Library className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Subjects Found</h2>
            <p>You need to create subjects and chapters before you can add MCQs.</p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-4">
            {subjects.map((subject) => {
              const SubjectIcon = iconMap[subject.icon] || Library;
              return (
                <AccordionItem value={subject.id} key={subject.id} className="border rounded-lg bg-card">
                  <AccordionTrigger className="text-xl font-bold hover:no-underline px-6">
                     <div className="flex items-center gap-3">
                        <SubjectIcon className="h-6 w-6 text-primary" />
                        {subject.name}
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                     <Accordion type="multiple" className="w-full space-y-2">
                        {subject.subSubjects && subject.subSubjects.map((subSubject) => {
                          const SubSubjectIcon = (subSubject.icon && iconMap[subSubject.icon]) || Folder;
                          return (
                            <AccordionItem value={subSubject.id} key={subSubject.id} className="border-b-0">
                              <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-muted/50 px-4 rounded-md">
                                <div className="flex items-center gap-3">
                                  <SubSubjectIcon className="h-5 w-5 text-primary/80" />
                                  {subSubject.name}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pl-8 pt-4">
                                 {subSubject.chapters && subSubject.chapters.length > 0 ? (
                                  <div className="space-y-4">
                                      {subSubject.chapters.map(chapter => (
                                        <Card key={chapter.id}>
                                            <CardHeader className="flex flex-row items-center justify-between">
                                               <CardTitle className="text-md flex items-center gap-3">
                                                  <FileText className="h-5 w-5" />
                                                  {chapter.name}
                                               </CardTitle>
                                               <MCQForm subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id}>
                                                   <Button size="sm">
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add MCQ Set
                                                   </Button>
                                               </MCQForm>
                                            </CardHeader>
                                            <CardContent>
                                                {(chapter.mcqSets && chapter.mcqSets.length > 0) ? (
                                                    <div className="space-y-3">
                                                        {chapter.mcqSets.map((mcqSet) => (
                                                            <div key={mcqSet.id} className="flex justify-between items-center p-3 border rounded-md bg-muted/30">
                                                                <p className="font-semibold">{mcqSet.name} ({mcqSet.mcqs.length} questions)</p>
                                                                <div className="flex items-center">
                                                                    <MCQForm subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id} mcqSet={mcqSet}>
                                                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                                                    </MCQForm>
                                                                    <DeleteMCQDialog subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id} mcqSetId={mcqSet.id} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-sm text-muted-foreground italic text-center py-4">No MCQ sets in this chapter yet.</p>}
                                            </CardContent>
                                        </Card>
                                      ))}
                                  </div>
                                ) : <p className="text-sm text-muted-foreground italic pt-2">No chapters yet for this sub-subject.</p>}
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
    </div>
  );
}
