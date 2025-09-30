
import { ReasoningForm } from "@/components/admin/reasoning/ReasoningForm";

export default async function NewReasoningSetPage() {
  return (
    <div className="w-full">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Create New Reasoning Set</h1>
            <p className="text-muted-foreground">Fill in the details below to add a new reasoning quiz.</p>
        </header>
        <ReasoningForm />
    </div>
  )
}
