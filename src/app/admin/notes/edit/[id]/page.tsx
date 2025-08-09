import { NoteForm } from "@/components/admin/NoteForm";
import { getNoteById, getChapters } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function EditNotePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const note = await getNoteById(id);
  const chapters = await getChapters();

  if (!note) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-headline font-bold">Edit Note</h1>
            <p className="text-muted-foreground">Update the details for this note.</p>
        </header>
        <NoteForm chapters={chapters} note={note} />
    </div>
  )
}
