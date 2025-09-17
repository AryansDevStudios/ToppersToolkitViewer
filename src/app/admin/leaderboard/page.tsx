
import { getUsers } from "@/lib/data";
import { Trophy } from "lucide-react";
import type { User } from "@/lib/types";
import { LeaderboardTable } from "@/components/admin/leaderboard/LeaderboardTable";

export const revalidate = 0;

export default async function AdminLeaderboardPage() {
  const users = await getUsers();
  
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
      <LeaderboardTable initialUsers={users} />
    </div>
  );
}
