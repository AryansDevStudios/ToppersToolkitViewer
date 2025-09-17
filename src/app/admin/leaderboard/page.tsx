
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUsers } from "@/lib/data";
import { Trophy, EyeOff } from "lucide-react";
import { UpdateScoreForm } from "@/components/admin/leaderboard/UpdateScoreForm";
import { ToggleLeaderboardSwitch } from "@/components/admin/leaderboard/ToggleLeaderboardSwitch";

export const revalidate = 0;

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
            View and manage user scores and visibility.
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
                <TableHead className="w-[100px] text-center">Visible</TableHead>
                <TableHead className="w-[120px] text-center">Score</TableHead>
                <TableHead className="w-[250px] text-right">Update Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user, index) => (
                  <TableRow key={user.id} className={user.showOnLeaderboard === false ? "bg-muted/30" : ""}>
                    <TableCell className="font-bold text-lg text-center">{index + 1}</TableCell>
                    <TableCell>
                        <div className="font-medium">{user.name || 'N/A'}</div>
                    </TableCell>
                    <TableCell className="text-center">
                        <ToggleLeaderboardSwitch userId={user.id} isVisible={user.showOnLeaderboard !== false} />
                    </TableCell>
                    <TableCell className="font-medium text-lg text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.score || 0}
                        {user.showOnLeaderboard === false && (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <UpdateScoreForm userId={user.id} currentScore={user.score || 0} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
