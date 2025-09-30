
import { getCurrentAffairsSets } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Newspaper, Edit } from "lucide-react";
import { CurrentAffairsForm } from "@/components/admin/current-affairs/CurrentAffairsForm";
import { DeleteCurrentAffairsDialog } from "@/components/admin/current-affairs/DeleteCurrentAffairsDialog";
import { format } from 'date-fns';

export const revalidate = 0;

export default async function AdminCurrentAffairsPage() {
  const sets = await getCurrentAffairsSets();

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-primary" />
            Current Affairs Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage current affairs quizzes.
          </p>
        </div>
        <CurrentAffairsForm>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Set
          </Button>
        </CurrentAffairsForm>
      </header>

      {sets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <Newspaper className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Quiz Sets Found</h2>
          <p className="mb-6">Get started by creating your first quiz set.</p>
          <CurrentAffairsForm>
            <Button>Create Your First Set</Button>
          </CurrentAffairsForm>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => {
            return (
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
                  <CurrentAffairsForm set={set}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </CurrentAffairsForm>
                  <DeleteCurrentAffairsDialog setId={set.id} />
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
