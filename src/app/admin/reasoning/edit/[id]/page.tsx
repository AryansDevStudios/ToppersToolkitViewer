
import { ReasoningForm } from "@/components/admin/reasoning/ReasoningForm";
import { getReasoningSets } from "@/lib/data";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function EditReasoningSetPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const allSets = await getReasoningSets();
  const set = allSets.find(s => s.id === id);

  if (!set) {
    notFound();
  }
  
  return (
    <div className="w-full">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Edit Reasoning Set</h1>
            <p className="text-muted-foreground">Update the details for this reasoning quiz.</p>
        </header>
        <ReasoningForm set={set} />
    </div>
  )
}
