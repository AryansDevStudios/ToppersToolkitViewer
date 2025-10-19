
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUsers } from "@/lib/data";
import { Trophy, Loader2 } from "lucide-react";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const rankColorMap: { [key: number]: string } = {
  1: "bg-amber-400 text-amber-900 border-amber-500",
  2: "bg-slate-300 text-slate-800 border-slate-400",
  3: "bg-orange-400 text-orange-900 border-orange-500",
};

const RankBadge = ({ rank }: { rank: number }) => {
  const colorClass = rankColorMap[rank] || "bg-muted text-muted-foreground";
  return (
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg border-2 ${colorClass}`}
    >
      {rank}
    </div>
  );
};

const TopPlayerCard = ({ user, rank }: { user: User; rank: number }) => {
  const colorClass =
    rank === 1
      ? "border-amber-400 bg-amber-50"
      : rank === 2
      ? "border-slate-300 bg-slate-50"
      : "border-orange-400 bg-orange-50";

  return (
    <Card
      className={`relative overflow-hidden shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 ${colorClass}`}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <Trophy
          className={`absolute -top-6 -right-6 h-24 w-24 opacity-10 ${
            rank === 1
              ? "text-amber-500"
              : rank === 2
              ? "text-slate-500"
              : "text-orange-500"
          }`}
        />
        <RankBadge rank={rank} />
        <h3 className="mt-4 text-2xl font-bold text-foreground text-black">{user.name}</h3>
        <Badge variant="secondary" className="mt-6 text-lg">
          {user.score || 0} Points
        </Badge>
      </CardContent>
    </Card>
  );
};

const LeaderboardSkeleton = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-4 w-48 rounded mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </CardContent>
        </Card>
    </>
);

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const allUsers = await getUsers();
      const visibleUsers = allUsers.filter(user => user.role !== 'Teacher' && user.showOnLeaderboard !== false);
      const sortedUsers = visibleUsers.sort((a, b) => (b.score || 0) - (a.score || 0));
      setUsers(sortedUsers);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Trophy className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          See who's at the top of the ranks.
        </p>
      </header>

      {loading ? (
        <LeaderboardSkeleton />
      ) : (
        <>
          {/* Top 3 players */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {topThree.map((user, index) => (
              <TopPlayerCard key={user.id} user={user} rank={index + 1} />
            ))}
          </div>

          {/* Rest of the players */}
          <Card>
            <CardHeader>
              <CardTitle>All Ranks</CardTitle>
              <CardDescription>
                The full list of player rankings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restOfUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="font-bold text-lg w-8 text-center text-muted-foreground">
                      {index + 4}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{user.name}</p>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {user.score || 0} Points
                    </Badge>
                  </div>
                ))}
              </div>
              {users.length === 0 && !loading && (
                <div className="text-center py-16 text-muted-foreground">
                  <p>No users found on the leaderboard yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
