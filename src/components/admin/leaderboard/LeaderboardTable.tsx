
"use client";

import { useState, useTransition, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface LeaderboardTableProps {
  initialUsers: User[];
}

export function LeaderboardTable({ initialUsers }: LeaderboardTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const [changedUserIds, setChangedUserIds] = useState<Set<string>>(new Set());

  const visibleUsers = useMemo(() => {
    return users
      .filter(u => u.showOnLeaderboard !== false)
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [users]);

  const hiddenUsers = useMemo(() => {
    return users.filter(u => u.showOnLeaderboard === false);
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

  const handleVisibilityChange = (userId: string, isVisible: boolean) => {
    setUsers(currentUsers =>
        currentUsers.map(user =>
            user.id === userId ? { ...user, showOnLeaderboard: isVisible } : user
        )
    );
    setChangedUserIds(prev => new Set(prev).add(userId));
  };


  const handleSave = () => {
    startTransition(async () => {
      const usersToUpdate = users.filter(user => changedUserIds.has(user.id));
      if (usersToUpdate.length === 0) {
        toast({ title: "No changes to save." });
        return;
      }

      const results = await Promise.all(
        usersToUpdate.map(user => upsertUser({ 
            id: user.id, 
            score: user.score,
            showOnLeaderboard: user.showOnLeaderboard,
        }))
      );

      const failedUpdates = results.filter(r => !r.success);

      if (failedUpdates.length > 0) {
        toast({
          title: "Some Updates Failed",
          description: "Not all user data could be saved. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Leaderboard Saved",
          description: "All changes have been successfully saved.",
        });
        setChangedUserIds(new Set());
        router.refresh();
      }
    });
  };
  
  const renderUserTable = (userList: User[], isVisibleList: boolean) => (
     <Table>
          <TableHeader>
            <TableRow>
              {isVisibleList && <TableHead className="w-[80px]">Rank</TableHead>}
              <TableHead>User</TableHead>
              <TableHead className="w-[100px] text-center">Visible</TableHead>
              <TableHead className="w-[150px] text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.length > 0 ? (
              userList.map((user, index) => (
                <TableRow key={user.id} className={user.showOnLeaderboard === false ? "bg-muted/30" : ""}>
                 {isVisibleList && <TableCell className="font-bold text-lg text-center">{index + 1}</TableCell>}
                  <TableCell>
                    <div className="font-medium">{user.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                        checked={user.showOnLeaderboard !== false}
                        onCheckedChange={(checked) => handleVisibilityChange(user.id, checked)}
                        disabled={isPending}
                        aria-label="Toggle user visibility on leaderboard"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                        {user.showOnLeaderboard === false && (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                            type="number"
                            value={user.score || 0}
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
                  No users in this list.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
  );

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Visible Users</CardTitle>
        <CardDescription>Users currently displayed on the public leaderboard, sorted by score.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
       {renderUserTable(visibleUsers, true)}
      </CardContent>
    </Card>

    <Separator className="my-8" />

    <Card>
         <CardHeader>
            <CardTitle>Hidden Users</CardTitle>
            <CardDescription>These users are not displayed on the public leaderboard.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
           {renderUserTable(hiddenUsers, false)}
        </CardContent>
    </Card>

     <div className="flex justify-end mt-8">
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
      </div>
    </>
  );
}
