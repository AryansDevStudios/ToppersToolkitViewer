import { NoteForm } from "@/components/admin/NoteForm";
import { getSubjects } from "@/lib/data";
import type { Subject } from "@/lib/types";

export const revalidate = 0;

// Helper function to create a serializable version of the subjects
const getSerializableSubjects = (subjects: Subject[]) => {
  return subjects.map(({ icon, ...rest }) => rest);
};

export default async function NewNotePage() {
  const allSubjects = await getSubjects();
  const subjects = getSerializableSubjects(allSubjects);
  
  return (
     <div className="max-w-2xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Upload New Note</h1>
            <p className="text-muted-foreground">Fill in the details below to add a new note.</p>
        </header>
        <NoteForm subjects={subjects} />
    </div>
  )
}
