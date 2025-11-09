
"use client";

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AggregatedLog } from '@/app/admin/activity/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Loader2, Trash2, FileJson } from 'lucide-react';
import { NoteDetailsDialog } from './NoteDetailsDialog';
import { Button } from '@/components/ui/button';
import { Subject } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface LogTableProps {
    logs: AggregatedLog[];
    subjects: Subject[];
}

export function LogTable({ logs, subjects }: LogTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, startTransition] = useTransition();
    const { toast } = useToast();

    const handleRefresh = () => {
        startTransition(async () => {
            try {
                localStorage.clear();
                sessionStorage.clear();

                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                }

                toast({
                    title: "Cache Cleared",
                    description: "All site caches have been cleared. The page will now reload.",
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } catch (error) {
                toast({
                    title: "Error",
                    description: "Could not clear all caches.",
                    variant: "destructive",
                });
            }
        });
    };
    
    const handleExportJson = () => {
        const jsonString = JSON.stringify(filteredLogs, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredLogs = useMemo(() => {
        if (!searchQuery) {
            return logs;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return logs.filter(log =>
            log.userName.toLowerCase().includes(lowercasedQuery) ||
            (log.action && log.action.toLowerCase().includes(lowercasedQuery)) ||
            (log.noteType && log.noteType.toLowerCase().includes(lowercasedQuery)) ||
            (log.chapterName && log.chapterName.toLowerCase().includes(lowercasedQuery))
        );
    }, [logs, searchQuery]);

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search logs by user, action, or note..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportJson}>
                        <FileJson className="mr-2 h-4 w-4" />
                        Export as JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        {isRefreshing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Clear Cache & Refresh
                    </Button>
                </div>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead className="hidden md:table-cell">Details</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, index) => (
                                <TableRow key={`${log.userId}-${log.timestamp}-${index}`}>
                                    <TableCell>
                                        <Button variant="link" asChild className="p-0 h-auto font-medium">
                                            <Link href={`/admin/users/access/${log.userId}`}>{log.userName}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold">{log.action || 'Viewed Note'}</span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <NoteDetailsDialog log={log} subjects={subjects} />
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs">
                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No activity logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
