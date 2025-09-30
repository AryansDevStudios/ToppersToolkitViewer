
import { getReasoningSets } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BrainCircuit, Edit, ClipboardCheck, Eye, User, BookCopy } from "lucide-react";
import { ReasoningForm } from "@/components/admin/reasoning/ReasoningForm";
import { DeleteReasoningDialog } from "@/components/admin/reasoning/DeleteReasoningDialog";
import { format } from 'date-fns';
import type { ReasoningSet } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export const revalidate = 0;

const ManageSetsTab = async ({ sets }: { sets: ReasoningSet[] }) => (
    <>
      <div className="flex justify-end mb-6">
        <ReasoningForm>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Set
          </Button>
        </ReasoningForm>
      </div>
      {sets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <BrainCircuit className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Reasoning Sets Found</h2>
          <p className="mb-6">Get started by creating your first quiz set.</p>
          <ReasoningForm>
            <Button>Create Your First Set</Button>
          </ReasoningForm>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <Card key={set.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{set.name}</CardTitle>
                <CardDescription>
                  {set.mcqs.length} questions
                </CardDescription>
              </CardHeader>
               <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                      Created on: {format(new Date(set.createdAt), 'PPP')}
                  </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 bg-muted/30 p-3">
                <ReasoningForm set={set}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </ReasoningForm>
                <DeleteReasoningDialog setId={set.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
);

// TODO: Implement attempt tracking and viewing for Reasoning quizzes
const ViewAttemptsTab = async () => (
    <Card>
        <CardHeader>
            <CardTitle>View Attempts</CardTitle>
            <CardDescription>Review user attempts for reasoning quizzes.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground py-16">Attempt tracking for reasoning quizzes is coming soon.</p>
        </CardContent>
    </Card>
);

export default async function AdminReasoningPage() {
  const sets = await getReasoningSets();

  return (
    <div className="space-y-8">
      <header>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-primary" />
            Reasoning Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and review Reasoning quizzes and attempts.
          </p>
      </header>
      
      <Tabs defaultValue="manage">
          <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage"><Edit className="mr-2 h-4 w-4" />Manage Sets</TabsTrigger>
              <TabsTrigger value="attempts"><ClipboardCheck className="mr-2 h-4 w-4" />View Attempts</TabsTrigger>
          </TabsList>
          <TabsContent value="manage" className="mt-6">
              <ManageSetsTab sets={sets} />
          </TabsContent>
           <TabsContent value="attempts" className="mt-6">
              <ViewAttemptsTab />
          </TabsContent>
      </Tabs>
    </div>
  );
}
