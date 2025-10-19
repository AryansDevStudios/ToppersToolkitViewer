
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { getNotices } from '@/lib/data';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useEffect, useState } from 'react';
import type { Notice } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const LAST_SEEN_NOTICE_KEY = 'lastSeenNoticeTimestamp';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const timeZone = 'Asia/Kolkata';

  useEffect(() => {
    async function fetchNotices() {
      setLoading(true);
      const fetchedNotices = await getNotices();
      setNotices(fetchedNotices);
      setLoading(false);
      
      if (fetchedNotices.length > 0) {
        localStorage.setItem(LAST_SEEN_NOTICE_KEY, String(fetchedNotices[0].createdAt));
      }
    }
    fetchNotices();
  }, []);

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
        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : notices.length > 0 ? (
          <div className="space-y-8">
            {notices.map((notice) => {
              const zonedDate = toZonedTime(new Date(notice.createdAt), timeZone);
              return (
              <Card key={notice.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">{notice.title}</CardTitle>
                  <CardDescription>
                    Posted on: {format(zonedDate, 'PPP p')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground whitespace-pre-wrap">{notice.content}</p>
                </CardContent>
              </Card>
            )})}
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
