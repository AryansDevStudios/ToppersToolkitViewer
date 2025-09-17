
import { getAllDoubts } from "@/lib/data";
import { MessageSquare, Check, Clock } from "lucide-react";
import type { Doubt } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { AnswerDoubtDialog } from "@/components/admin/doubts/AnswerDoubtDialog";

export const revalidate = 0;

const DoubtCard = ({ doubt }: { doubt: Doubt }) => {
    const timeZone = 'Asia/Kolkata';
    const zonedDate = toZonedTime(new Date(doubt.createdAt), timeZone);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{doubt.userName}</CardTitle>
                        <CardDescription>{doubt.userClassAndSection || 'N/A'}</CardDescription>
                    </div>
                    <Badge variant={doubt.status === 'answered' ? 'default' : 'secondary'}>
                        {doubt.status}
                    </Badge>
                </div>
                 <p className="text-xs text-muted-foreground pt-2">
                    Asked on: {format(zonedDate, "PPP p")}
                </p>
            </CardHeader>
            <CardContent>
                <p className="font-semibold">{doubt.question}</p>
                {doubt.status === 'answered' && doubt.answer && (
                    <div className="mt-4 bg-muted p-3 rounded-md border">
                        <p className="text-sm font-semibold text-primary">Reply:</p>
                        <p className="text-sm whitespace-pre-wrap">{doubt.answer}</p>
                         {doubt.answeredAt && (
                             <p className="text-xs text-muted-foreground pt-2 mt-2 border-t">
                                Answered by {doubt.answeredBy} on {format(toZonedTime(new Date(doubt.answeredAt), timeZone), "PPP p")}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
            {doubt.status === 'pending' && (
                <CardFooter className="flex justify-end bg-muted/30 p-3">
                    <AnswerDoubtDialog doubt={doubt} />
                </CardFooter>
            )}
        </Card>
    )
}


export default async function AdminDoubtsPage() {
    const allDoubts = await getAllDoubts();

    const pendingDoubts = allDoubts.filter(d => d.status === 'pending');
    const answeredDoubts = allDoubts.filter(d => d.status === 'answered');

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    Doubt Management
                </h1>
                <p className="text-muted-foreground">
                    Respond to questions submitted by students.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6" />
                        Pending Questions ({pendingDoubts.length})
                    </h2>
                    {pendingDoubts.length > 0 ? (
                        pendingDoubts.map(doubt => <DoubtCard key={doubt.id} doubt={doubt} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg">No pending questions.</p>
                    )}
                </section>

                 <section className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Check className="w-6 h-6" />
                        Answered Questions ({answeredDoubts.length})
                    </h2>
                     {answeredDoubts.length > 0 ? (
                        answeredDoubts.map(doubt => <DoubtCard key={doubt.id} doubt={doubt} />)
                    ) : (
                         <p className="text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg">No questions have been answered yet.</p>
                    )}
                </section>
            </div>
        </div>
    );
}
