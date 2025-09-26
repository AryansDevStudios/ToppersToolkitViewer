
"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/lib/data";
import { Loader2, Trophy } from "lucide-react";
import type { User } from "@/lib/types";
import { LeaderboardTable } from "@/components/admin/leaderboard/LeaderboardTable";

export default function AdminLeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    }
    fetchUsers();
  }, []);
  
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <LeaderboardTable initialUsers={users} />
      )}
    </div>
  );
}
