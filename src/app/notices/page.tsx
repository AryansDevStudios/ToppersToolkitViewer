
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { getNotices } from '@/lib/data';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function NoticesPage() {
  const notices = await getNotices();

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <ClipboardList className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Notices
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Stay updated with the latest announcements.
        </p>
      </header>
      <main className="max-w-3xl mx-auto">
        {notices.length > 0 ? (
          <div className="space-y-8">
            {notices.map((notice) => (
              <Card key={notice.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">{notice.title}</CardTitle>
                  <CardDescription>
                    Posted on: {format(new Date(notice.createdAt), 'PPP p')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground whitespace-pre-wrap">{notice.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Notices Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                There are no announcements right now. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
