import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, BookCopy, AlertCircle } from "lucide-react";
import { getDashboardStats } from "@/lib/data";

export default async function AdminDashboardPage() {
  const { totalNotes, totalSubjects } = await getDashboardStats();

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
            </CardContent>
          </Card>
        ))}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
               <p className="text-xs text-muted-foreground">
                User data is unavailable.
              </p>
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Activity feed will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
