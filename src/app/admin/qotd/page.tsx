
import { getQuestionsOfTheDay } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, HelpCircle, Edit } from "lucide-react";
import { QotdForm } from "@/components/admin/qotd/QotdForm";
import Link from "next/link";
import { format } from "date-fns";
import { DeleteQotdDialog } from "@/components/admin/qotd/DeleteQotdDialog";

export const revalidate = 0;

export default async function AdminQotdPage() {
  const questions = await getQuestionsOfTheDay();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
             <HelpCircle className="w-8 h-8 text-primary" />
            Question of the Day
          </h1>
          <p className="text-muted-foreground">
            Manage the daily questions for your users.
          </p>
        </div>
        <QotdForm>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </QotdForm>
      </header>

       {questions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <HelpCircle className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Questions Found</h2>
            <p className="mb-6">Get started by creating your first question.</p>
             <QotdForm>
                <Button>Create Your First Question</Button>
            </QotdForm>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((q) => (
                <Card key={q.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{q.question}</CardTitle>
                    <CardDescription>
                      For Date: {format(new Date(q.date), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                      <ul className="space-y-2 text-sm">
                        {q.options.map((opt, index) => {
                            const isCorrect = q.correctOptionIndex === index;
                            return (
                                <li key={index} className={`p-2 rounded-md ${isCorrect ? 'bg-green-100 dark:bg-green-900/50 font-bold' : 'bg-muted/50'}`}>
                                    {opt.text}
                                </li>
                            )
                        })}
                      </ul>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 bg-muted/30 p-3">
                      <QotdForm question={q}>
                        <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      </QotdForm>
                      <DeleteQotdDialog questionId={q.id} />
                  </CardFooter>
                </Card>
              )
            )}
          </div>
        )}
    </div>
  );
}
