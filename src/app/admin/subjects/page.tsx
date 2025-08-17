
import { getSubjects, getUsers } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlusCircle, Library, Folder, FileText, Edit, Eye, Users } from "lucide-react";
import { SubjectForm } from "@/components/admin/subjects/SubjectForm";
import { SubSubjectForm } from "@/components/admin/subjects/SubSubjectForm";
import { ChapterForm } from "@/components/admin/subjects/ChapterForm";
import { DeleteDialog } from "@/components/admin/subjects/DeleteDialog";
import { iconMap } from "@/lib/iconMap";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { NoteAccessDialog } from "@/components/admin/subjects/NoteAccessDialog";
import type { User } from "@/lib/types";

export const revalidate = 0;

export default async function AdminSubjectsPage() {
  const subjects = await getSubjects();
  const users: User[] = await getUsers();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects Management</h1>
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

       {subjects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <Library className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Subjects Found</h2>
            <p className="mb-6">Get started by creating your first subject.</p>
            <SubjectForm trigger={<Button>Create Your First Subject</Button>} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {subjects.map((subject) => {
              const SubjectIcon = iconMap[subject.icon] || Library;
              return (
                <Card key={subject.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-4">
                      <SubjectIcon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-2xl">{subject.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                       <SubSubjectForm subjectId={subject.id} trigger={
                        <Button variant="outline">
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Sub-Subject
                        </Button>
                       } />
                      <SubjectForm subject={subject} />
                      <DeleteDialog type="Subject" subjectId={subject.id} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {subject.subSubjects && subject.subSubjects.length > 0 ? (
                      <Accordion type="multiple" className="w-full">
                        {subject.subSubjects.map((subSubject) => {
                          const SubSubjectIcon = (subSubject.icon && iconMap[subSubject.icon]) || Folder;
                          return (
                            <AccordionItem value={subSubject.id} key={subSubject.id} className="border-x-0 border-t-0 last:border-b-0 px-6">
                              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                                <div className="flex items-center gap-3">
                                  <SubSubjectIcon className="h-5 w-5 text-primary/80" />
                                  {subSubject.name}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pl-8 pb-6 border-l-2 border-primary/20">
                                 <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-md font-semibold">Chapters</h4>
                                     <div className="flex items-center gap-2">
                                       <ChapterForm subjectId={subject.id} subSubjectId={subSubject.id} trigger={
                                          <Button variant="outline" size="sm">
                                              <PlusCircle className="mr-2 h-4 w-4" /> Add Chapter
                                          </Button>
                                       } />
                                       <SubSubjectForm subjectId={subject.id} subSubject={subSubject} />
                                       <DeleteDialog type="Sub-Subject" subjectId={subject.id} subSubjectId={subSubject.id} />
                                   </div>
                                 </div>
                                 
                                {subSubject.chapters && subSubject.chapters.length > 0 ? (
                                  <div className="space-y-4">
                                      {subSubject.chapters.map(chapter => (
                                        <div key={chapter.id} className="p-4 rounded-md bg-muted/40 border">
                                            <div className="flex items-center justify-between mb-3">
                                               <div className="flex items-center gap-3 font-semibold text-base">
                                                  <FileText className="h-5 w-5 text-primary/70" />
                                                  <span>{chapter.name}</span>
                                               </div>
                                               <div className="flex items-center gap-1">
                                                  <ChapterForm subjectId={subject.id} subSubjectId={subSubject.id} chapter={chapter} />
                                                  <DeleteDialog type="Chapter" subjectId={subject.id} subSubjectId={subSubject.id} chapterId={chapter.id} />
                                              </div>
                                            </div>
                                            {chapter.notes && chapter.notes.length > 0 ? (
                                              <ul className="space-y-2 pl-8">
                                                {chapter.notes.map(note => {
                                                  const usersWithAccess = users.filter(user => user.noteAccess?.includes(note.id));
                                                  return (
                                                    <li key={note.id} className="flex items-center justify-between text-sm py-1 border-t border-dashed border-border last:border-b-0">
                                                      <span>- {note.type}</span>
                                                      <div className="flex items-center gap-1">
                                                        <NoteAccessDialog note={note} users={usersWithAccess} />
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                          <Link href={`/admin/notes/edit/${note.id}`}>
                                                            <Edit className="h-4 w-4" />
                                                            <span className="sr-only">Edit Note</span>
                                                          </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                           <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">View PDF</span>
                                                           </a>
                                                        </Button>
                                                      </div>
                                                    </li>
                                                  )
                                                })}
                                              </ul>
                                            ) : <p className="text-xs text-muted-foreground italic pl-8 pt-2 border-t border-dashed">No notes in this chapter.</p>}
                                        </div>
                                      ))}
                                  </div>
                                ) : <p className="text-sm text-muted-foreground italic pt-2">No chapters yet for this sub-subject.</p>}
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <p>No sub-subjects have been added to {subject.name} yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
    </div>
  );
}
