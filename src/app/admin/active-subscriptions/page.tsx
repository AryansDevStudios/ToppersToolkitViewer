

import { getUsers } from "@/lib/data";
import { CheckCircle, Clock, Edit } from "lucide-react";
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
import { format, formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { subMonths } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ExtendSubscriptionDialog } from "@/components/admin/subscriptions/ExtendSubscriptionDialog";

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
  const timeZone = 'Asia/Kolkata';
  
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
                <TableHead className="hidden lg:table-cell">Class</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden lg:table-cell">Started On</TableHead>
                <TableHead className="text-right">Expires</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSubscribers.length > 0 ? (
                activeSubscribers.map((user) => {
                  const isExpired = user.subscriptionExpiresAt ? user.subscriptionExpiresAt < Date.now() : false;
                  const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
                  const startedAt = expiresAt ? subMonths(expiresAt, 1) : null;
                  const expiresIn = expiresAt && !isExpired ? formatDistanceToNowStrict(expiresAt, { addSuffix: true }) : null;

                  const zonedExpiresAt = expiresAt ? toZonedTime(expiresAt, timeZone) : null;
                  const zonedStartedAt = startedAt ? toZonedTime(startedAt, timeZone) : null;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="font-medium">{user.name}</span>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                      </TableCell>
                       <TableCell className="hidden lg:table-cell">
                          {user.classAndSection || 'N/A'}
                       </TableCell>
                       <TableCell className="hidden md:table-cell">
                          <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Teacher' ? 'secondary' : 'default'}>{user.role}</Badge>
                       </TableCell>
                       <TableCell className="hidden lg:table-cell">
                          {zonedStartedAt ? format(zonedStartedAt, 'Pp') : 'N/A'}
                       </TableCell>
                      <TableCell className={cn("text-right font-medium", isExpired && "text-destructive")}>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center justify-end gap-2">
                                {isExpired && <Clock className="h-4 w-4" />}
                                {zonedExpiresAt ? format(zonedExpiresAt, 'Pp') : 'N/A'}
                            </div>
                            {expiresIn && (
                                <p className="text-xs text-muted-foreground">{expiresIn}</p>
                            )}
                        </div>
                      </TableCell>
                       <TableCell className="text-right">
                          <ExtendSubscriptionDialog user={user} />
                       </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
