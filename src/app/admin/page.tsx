
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, BookCopy, ArrowRight } from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import { List, ListItem } from "@/components/ui/list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const { totalNotes, totalSubjects, totalUsers, recentNotes } = await getDashboardStats();

  const stats = [
    {
      title: "Total Notes",
      value: totalNotes,
      icon: FileText,
    },
    {
      title: "Total Subjects",
      value: totalSubjects,
      icon: BookCopy,
    },
     {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your platform's activity.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground pt-1">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
           <CardDescription>A log of recent uploads and changes.</CardDescription>
        </CardHeader>
        <CardContent>
           {recentNotes.length > 0 ? (
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {recentNotes.map((note, noteIdx) => (
                  <li key={note.id}>
                    <div className="relative pb-8">
                      {noteIdx !== recentNotes.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-background'>
                            <FileText className="h-4 w-4 text-primary" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-foreground">
                              New <Badge variant="secondary">{note.type}</Badge> added to <span className="font-medium">{note.chapter}</span>
                            </p>
                             <p className="text-xs text-muted-foreground mt-1">
                              {note.subject}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-muted-foreground">
                             <Button asChild variant="ghost" size="icon">
                               <Link href={note.slug}>
                                <ArrowRight className="h-4 w-4" />
                               </Link>
                             </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No recent activity to display.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
