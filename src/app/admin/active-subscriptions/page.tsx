
import { getUsers } from "@/lib/data";
import { User, CheckCircle, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User as UserType } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const revalidate = 0;

const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
};

export default async function ActiveSubscriptionsPage() {
  const allUsers = await getUsers();
  
  const activeSubscribers = allUsers
    .filter(user => user.hasFullNotesAccess && user.subscriptionExpiresAt)
    .sort((a, b) => (a.subscriptionExpiresAt || 0) - (b.subscriptionExpiresAt || 0));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle className="w-8 h-8 text-green-500" />
          Active Subscriptions
        </h1>
        <p className="text-muted-foreground">
          A list of all users with an active full-access subscription.
        </p>
      </header>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Expires On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSubscribers.length > 0 ? (
                activeSubscribers.map((user) => {
                  const isExpired = user.subscriptionExpiresAt ? user.subscriptionExpiresAt < Date.now() : false;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className={cn("text-right font-medium", isExpired && "text-destructive")}>
                        <div className="flex items-center justify-end gap-2">
                            {isExpired && <Clock className="h-4 w-4" />}
                            {user.subscriptionExpiresAt ? format(new Date(user.subscriptionExpiresAt), 'PPP') : 'N/A'}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No active subscriptions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
