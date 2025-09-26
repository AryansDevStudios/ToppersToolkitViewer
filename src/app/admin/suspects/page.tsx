
import { getUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { ShieldAlert, Users as UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
};

const findSuspects = (users: User[]): Record<string, User[]> => {
    const gpuMap: Record<string, Set<string>> = {};

    users.forEach(user => {
        if (user.loginLogs) {
            user.loginLogs.forEach(log => {
                if (log.gpuInfo && log.gpuInfo !== 'Unknown') {
                    if (!gpuMap[log.gpuInfo]) {
                        gpuMap[log.gpuInfo] = new Set();
                    }
                    gpuMap[log.gpuInfo].add(user.id);
                }
            });
        }
    });
    
    const userMap = new Map(users.map(u => [u.id, u]));
    const suspects: Record<string, User[]> = {};

    for (const gpuInfo in gpuMap) {
        const userIds = Array.from(gpuMap[gpuInfo]);
        if (userIds.length > 1) {
            suspects[gpuInfo] = userIds.map(id => userMap.get(id)).filter(Boolean) as User[];
        }
    }

    return suspects;
};


export default async function AdminSuspectsPage() {
    const users = await getUsers();
    const suspectGroups = findSuspects(users);
    const suspectGroupEntries = Object.entries(suspectGroups);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-destructive" />
                    Suspected Users
                </h1>
                <p className="text-muted-foreground">
                    Groups of users flagged for potential account sharing based on identical GPU information.
                </p>
            </header>

            {suspectGroupEntries.length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-4">
                    {suspectGroupEntries.map(([gpuInfo, userGroup]) => (
                        <AccordionItem value={gpuInfo} key={gpuInfo} className="border rounded-lg bg-card">
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline px-6">
                                <div className="flex flex-col items-start text-left">
                                   <span>{userGroup.length} Users Sharing GPU</span>
                                   <span className="text-xs font-mono text-muted-foreground font-normal mt-1">{gpuInfo}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <ul className="space-y-4">
                                    {userGroup.map(user => (
                                        <li key={user.id}>
                                            <Card>
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar>
                                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{user.name}</p>
                                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                                            <p className="text-xs text-primary">{user.role}</p>
                                                        </div>
                                                    </div>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/admin/users/access/${user.id}`}>Manage User</Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <UsersIcon className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Suspects Found</h2>
                    <p>No users have been flagged for potential account sharing at this time.</p>
                </div>
            )}
        </div>
    );
}
