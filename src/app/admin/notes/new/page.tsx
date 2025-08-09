import { NoteForm } from "@/components/admin/NoteForm";
import { getSubjects } from "@/lib/data";

export default async function NewNotePage() {
  const subjects = await getSubjects();
  return (
     <div className="max-w-2xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-headline font-bold">Upload New Note</h1>
            <p className="text-muted-foreground">Fill in the details below to add a new note.</p>
        </header>
        <NoteForm subjects={subjects} />
    </div>
  )
}
