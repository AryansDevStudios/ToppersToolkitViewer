
import { getAllComplaints } from "@/lib/data";
import { FileQuestion, Check, Clock, Edit } from "lucide-react";
import type { Complaint } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnswerComplaintDialog } from "@/components/admin/complaints/AnswerComplaintDialog";
import { DeleteComplaintDialog } from "@/components/admin/complaints/DeleteComplaintDialog";

export const revalidate = 0;

const ComplaintCard = ({ complaint }: { complaint: Complaint }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{complaint.userName}</CardTitle>
                        <CardDescription>{complaint.userClassAndSection || 'N/A'}</CardDescription>
                    </div>
                    <Badge variant={complaint.status === 'resolved' ? 'default' : 'secondary'}>
                        {complaint.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="font-semibold">{complaint.content}</p>
                {complaint.status === 'resolved' && complaint.response && (
                    <div className="mt-4 bg-muted p-3 rounded-md border">
                        <p className="text-sm font-semibold text-primary">Response:</p>
                        <p className="text-sm whitespace-pre-wrap">{complaint.response}</p>
                         {complaint.resolvedBy && (
                             <p className="text-xs text-muted-foreground pt-2 mt-2 border-t">
                                Responded by {complaint.resolvedBy}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-muted/30 p-3">
                {complaint.status === 'pending' && <AnswerComplaintDialog complaint={complaint} />}
                {complaint.status === 'resolved' && (
                    <AnswerComplaintDialog complaint={complaint}>
                         <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </button>
                    </AnswerComplaintDialog>
                )}
                <DeleteComplaintDialog complaintId={complaint.id} />
            </CardFooter>
        </Card>
    )
}


export default async function AdminComplaintsPage() {
    const allComplaints = await getAllComplaints();

    const pendingComplaints = allComplaints.filter(c => c.status === 'pending');
    const resolvedComplaints = allComplaints.filter(c => c.status === 'resolved');

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <FileQuestion className="w-8 h-8 text-primary" />
                    Complaint Management
                </h1>
                <p className="text-muted-foreground">
                    Respond to complaints submitted by users.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6" />
                        Pending Complaints ({pendingComplaints.length})
                    </h2>
                    {pendingComplaints.length > 0 ? (
                        pendingComplaints.map(complaint => <ComplaintCard key={complaint.id} complaint={complaint} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg">No pending complaints.</p>
                    )}
                </section>

                 <section className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Check className="w-6 h-6" />
                        Resolved Complaints ({resolvedComplaints.length})
                    </h2>
                     {resolvedComplaints.length > 0 ? (
                        resolvedComplaints.map(complaint => <ComplaintCard key={complaint.id} complaint={complaint} />)
                    ) : (
                         <p className="text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg">No complaints have been resolved yet.</p>
                    )}
                </section>
            </div>
        </div>
    );
}
