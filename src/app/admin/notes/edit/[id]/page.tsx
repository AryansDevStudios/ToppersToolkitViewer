import { NoteForm } from "@/components/admin/NoteForm";
import { getNoteById, getSubjects } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Subject } from "@/lib/types";

export const revalidate = 0;

// Helper function to create a serializable version of the subjects
const getSerializableSubjects = (subjects: Subject[]) => {
  return subjects.map(({ icon, ...rest }) => rest);
};

export default async function EditNotePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const note = await getNoteById(id);
  const allSubjects = await getSubjects();

  if (!note) {
    notFound();
  }

  const subjects = getSerializableSubjects(allSubjects);
  
  return (
    <div className="max-w-2xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Edit Note</h1>
            <p className="text-muted-foreground">Update the details for this note.</p>
        </header>
        <NoteForm subjects={subjects} note={note} />
    </div>
  )
}
