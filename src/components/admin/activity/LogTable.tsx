
"use client";

import { useState, useMemo } from 'react';
import type { AggregatedLog } from '@/app/admin/activity/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { NoteDetailsDialog } from './NoteDetailsDialog';
import { Button } from '@/components/ui/button';
import { Subject } from '@/lib/types';
import Link from 'next/link';

interface LogTableProps {
    logs: AggregatedLog[];
    subjects: Subject[];
}

export function LogTable({ logs, subjects }: LogTableProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLogs = useMemo(() => {
        if (!searchQuery) {
            return logs;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return logs.filter(log =>
            log.userName.toLowerCase().includes(lowercasedQuery) ||
            log.action.toLowerCase().includes(lowercasedQuery) ||
            log.noteType.toLowerCase().includes(lowercasedQuery) ||
            log.chapterName.toLowerCase().includes(lowercasedQuery)
        );
    }, [logs, searchQuery]);

    return (
        <div>
            <div className="relative max-w-sm mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search logs by user, action, or note..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                />
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
                                        <span className="font-semibold">{log.action}</span>
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
