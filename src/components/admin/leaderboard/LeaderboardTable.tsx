
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { upsertUser } from "@/lib/data";
import { ToggleLeaderboardSwitch } from "./ToggleLeaderboardSwitch";

interface LeaderboardTableProps {
  initialUsers: User[];
}

type UserWithScore = User & { score: number };

export function LeaderboardTable({ initialUsers }: LeaderboardTableProps) {
  const [users, setUsers] = useState<UserWithScore[]>(
    initialUsers.map(u => ({ ...u, score: u.score || 0 }))
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const [changedUserIds, setChangedUserIds] = useState<Set<string>>(new Set());

  // Re-sort users whenever the 'users' state changes
  useEffect(() => {
    const sorted = [...users].sort((a, b) => b.score - a.score);
    // Only update state if the order has actually changed to prevent infinite loops
    if (JSON.stringify(users) !== JSON.stringify(sorted)) {
      setUsers(sorted);
    }
  }, [users]);


  const handleScoreChange = (userId: string, newScore: string) => {
    const scoreValue = parseInt(newScore, 10);
    if (!isNaN(scoreValue)) {
      setUsers(currentUsers =>
        currentUsers.map(user =>
          user.id === userId ? { ...user, score: scoreValue } : user
        )
      );
      setChangedUserIds(prev => new Set(prev).add(userId));
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const usersToUpdate = users.filter(user => changedUserIds.has(user.id));
      if (usersToUpdate.length === 0) {
        toast({ title: "No changes to save." });
        return;
      }

      const results = await Promise.all(
        usersToUpdate.map(user => upsertUser({ id: user.id, score: user.score }))
      );

      const failedUpdates = results.filter(r => !r.success);

      if (failedUpdates.length > 0) {
        toast({
          title: "Some Updates Failed",
          description: "Not all user scores could be saved. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scores Saved",
          description: "All changes have been successfully saved.",
        });
        setChangedUserIds(new Set());
        router.refresh();
      }
    });
  };

  return (
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
              <TableHead className="w-[150px] text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={user.id} className={user.showOnLeaderboard === false ? "bg-muted/30" : ""}>
                  <TableCell className="font-bold text-lg text-center">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{user.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <ToggleLeaderboardSwitch userId={user.id} isVisible={user.showOnLeaderboard !== false} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                        {user.showOnLeaderboard === false && (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                            type="number"
                            value={user.score}
                            onChange={(e) => handleScoreChange(user.id, e.target.value)}
                            className="w-24 text-right"
                            disabled={isPending}
                        />
                    </div>
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
       <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending || changedUserIds.size === 0}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              `Save Changes (${changedUserIds.size})`
            )}
          </Button>
      </CardFooter>
    </Card>
  );
}
