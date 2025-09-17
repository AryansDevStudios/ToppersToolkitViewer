
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getUsers } from "@/lib/data";
import { Trophy } from "lucide-react";
import type { User } from "@/lib/types";

export const revalidate = 0;

const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";
  const names = name.trim().split(" ").filter(Boolean);
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0].substring(0, 2).toUpperCase();
};

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
      className={`relative overflow-hidden shadow-lg transition-transform hover:-translate-y-2 ${colorClass}`}
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
        <Avatar className="w-24 h-24 mt-4 border-4 border-background">
          <AvatarFallback className="text-3xl">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-4 text-2xl font-bold">{user.name}</h3>
        <p className="text-muted-foreground">{user.email}</p>
        <Badge variant="secondary" className="mt-4 text-lg">
          {user.score || 0} Points
        </Badge>
      </CardContent>
    </Card>
  );
};

export default async function LeaderboardPage() {
  const users = await getUsers();
  const sortedUsers = users.sort((a, b) => (b.score || 0) - (a.score || 0));
  const topThree = sortedUsers.slice(0, 3);
  const restOfUsers = sortedUsers.slice(3);

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
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline" className="text-base">
                  {user.score || 0} Points
                </Badge>
              </div>
            ))}
          </div>
          {sortedUsers.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p>No users found on the leaderboard yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
