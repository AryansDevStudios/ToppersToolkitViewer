
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, BookCopy, Printer, FileQuestion, MessageSquare } from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const { totalNotes, totalSubjects, totalUsers, totalPendingOrders, totalPendingComplaints, totalPendingDoubts } = await getDashboardStats();

  const stats = [
    {
      title: "Total Notes",
      value: totalNotes,
      icon: FileText,
      href: "/admin/notes"
    },
    {
      title: "Total Subjects",
      value: totalSubjects,
      icon: BookCopy,
      href: "/admin/subjects"
    },
     {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      href: "/admin/users"
    },
    {
      title: "Pending Orders",
      value: totalPendingOrders,
      icon: Printer,
      href: "/admin/orders"
    },
    {
      title: "Pending Doubts",
      value: totalPendingDoubts,
      icon: MessageSquare,
      href: "/admin/doubts"
    },
    {
      title: "Pending Complaints",
      value: totalPendingComplaints,
      icon: FileQuestion,
      href: "/admin/complaints"
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your platform's activity.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} className="block">
            <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
