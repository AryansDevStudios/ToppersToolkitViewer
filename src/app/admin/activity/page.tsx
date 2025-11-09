
import { getUsers, getNoteById, getSubjects } from "@/lib/data";
import { Activity } from "lucide-react";
import type { NoteViewLog, User } from "@/lib/types";
import { LogTable } from "@/components/admin/activity/LogTable";

export const revalidate = 0;

export interface AggregatedLog extends NoteViewLog {
    userName: string;
    userId: string;
}

export default async function AdminActivityPage() {
    const users = await getUsers();
    const allSubjects = await getSubjects();

    const allLogs: AggregatedLog[] = users.flatMap(user => {
        if (!user.viewedNotes || user.viewedNotes.length === 0) {
            return [];
        }
        return user.viewedNotes.map(log => ({
            ...log,
            userName: user.name,
            userId: user.id,
        }));
    }).sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Activity className="w-8 h-8 text-primary" />
                    User Activity
                </h1>
                <p className="text-muted-foreground">
                    A real-time log of user interactions with notes.
                </p>
            </header>

            <LogTable logs={allLogs} subjects={allSubjects} />
        </div>
    );
}
