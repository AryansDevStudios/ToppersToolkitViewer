
import { getNotices } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { NoticeForm } from "@/components/admin/notices/NoticeForm";
import { DeleteNoticeDialog } from "@/components/admin/notices/DeleteNoticeDialog";

export const revalidate = 0;

export default async function AdminNoticesPage() {
  const notices = await getNotices();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-primary" />
            Notices Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage announcements for your users.
          </p>
        </div>
        <NoticeForm>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Notice
          </Button>
        </NoticeForm>
      </header>

      {notices.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <ClipboardList className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Notices Found</h2>
          <p className="mb-6">Get started by creating your first notice.</p>
          <NoticeForm>
            <Button>Create Your First Notice</Button>
          </NoticeForm>
        </div>
      ) : (
        <div className="space-y-6">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader>
                <CardTitle>{notice.title}</CardTitle>
                <CardDescription>
                  Posted on: {format(new Date(notice.createdAt), "PPP p")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{notice.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 bg-muted/30 p-3">
                <NoticeForm notice={notice}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </NoticeForm>
                <DeleteNoticeDialog noticeId={notice.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
