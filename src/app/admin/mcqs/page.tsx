
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
          Create, edit, and delete Multiple Choice Questions for practice quizzes.
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
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add MCQ
                                                   </Button>
                                               </MCQForm>
                                            </CardHeader>
                                            <CardContent>
                                                {(chapter.mcqs && chapter.mcqs.length > 0) ? (
                                                    <div className="space-y-3">
                                                        {chapter.mcqs.map((mcq, index) => (
                                                            <div key={mcq.id} className="flex justify-between items-start p-3 border rounded-md bg-muted/30">
                                                                <div>
                                                                    <p className="font-semibold">{index + 1}. {mcq.question}</p>
                                                                    <ol className="list-decimal list-inside text-sm text-muted-foreground mt-2 space-y-1">
                                                                        {mcq.options.map((option, optIndex) => (
                                                                            <li key={optIndex} className={optIndex === mcq.correctOptionIndex ? 'font-bold text-green-600' : ''}>
                                                                                {option}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <MCQForm subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id} mcq={mcq}>
                                                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                                                    </MCQForm>
                                                                    <DeleteMCQDialog subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id} mcqId={mcq.id} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-sm text-muted-foreground italic text-center py-4">No MCQs in this chapter yet.</p>}
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
