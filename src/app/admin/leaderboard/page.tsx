
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUsers } from "@/lib/data";
import { Trophy } from "lucide-react";
import type { User } from "@/lib/types";
import { UpdateScoreForm } from "@/components/admin/leaderboard/UpdateScoreForm";

export const revalidate = 0;

const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
};

export default async function AdminLeaderboardPage() {
  const users = await getUsers();
  const sortedUsers = users.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-500" />
            Leaderboard Management
          </h1>
          <p className="text-muted-foreground">
            View and manage user scores.
          </p>
        </div>
      </header>
      <Card>
         <CardHeader>
           <CardTitle>User Scores</CardTitle>
           <CardDescription>A list of all users and their scores.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="w-[120px] text-center">Current Score</TableHead>
                <TableHead className="w-[250px] text-right">Update Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold text-lg text-center">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                           <div className="font-medium">{user.name || 'N/A'}</div>
                           <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-lg text-center">{user.score || 0}</TableCell>
                    <TableCell className="text-right">
                       <UpdateScoreForm userId={user.id} currentScore={user.score || 0} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No users found.
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
