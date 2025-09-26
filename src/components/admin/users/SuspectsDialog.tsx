
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, Users as UsersIcon } from "lucide-react";
import type { User } from "@/lib/types";
import Link from "next/link";

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


interface SuspectsDialogProps {
  users: User[];
}

export function SuspectsDialog({ users }: SuspectsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const suspectGroups = useMemo(() => findSuspects(users), [users]);
  const suspectGroupEntries = Object.entries(suspectGroups);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
          <ShieldAlert className="mr-2 h-4 w-4" />
          View Suspects
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Suspected Users</DialogTitle>
          <DialogDescription>
            Groups of users flagged for potential account sharing based on identical GPU information.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
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
                                                    <Button asChild variant="outline" size="sm" onClick={() => setIsOpen(false)}>
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
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center">
                    <UsersIcon className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Suspects Found</h2>
                    <p>No users have been flagged for potential account sharing at this time.</p>
                </div>
            )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
