
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Activity, Smartphone, Monitor, Cpu, MemoryStick, ScreenShare, MousePointerClick } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User, LoginLog } from "@/lib/types";
import { format } from 'date-fns';

interface LoginHistoryDialogProps {
  user: User;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | number | null }) => (
    <div className="flex items-start">
        <Icon className="h-4 w-4 text-muted-foreground mr-3 mt-1 flex-shrink-0" />
        <div className="flex flex-col">
            <dt className="font-semibold text-sm">{label}</dt>
            <dd className="text-sm text-muted-foreground">{value || 'N/A'}</dd>
        </div>
    </div>
);


export function LoginHistoryDialog({ user }: LoginHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Sort logs from most recent to oldest
  const sortedLogs = user.loginLogs?.sort((a, b) => b.timestamp - a.timestamp) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Activity className="mr-2 h-4 w-4" />
          View Activity
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Login History for {user.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
            {sortedLogs.length > 0 ? (
                <div className="space-y-6">
                    {sortedLogs.map((log: LoginLog, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                            <h3 className="font-bold mb-3">
                                {format(new Date(log.timestamp), "PPP p")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <dl className="space-y-4">
                                    <DetailItem icon={log.deviceType === 'Mobile' ? Smartphone : Monitor} label="Device" value={`${log.deviceType} (${log.os})`} />
                                    <DetailItem icon={ScreenShare} label="Browser" value={log.browser} />
                                    <DetailItem icon={MousePointerClick} label="Pointing Method" value={log.pointingMethod} />
                                    <DetailItem icon={Monitor} label="Screen" value={log.screenResolution} />
                                </dl>
                                 <dl className="space-y-4">
                                    <DetailItem icon={Cpu} label="CPU Cores" value={log.cpuCores} />
                                    <DetailItem icon={MemoryStick} label="RAM" value={log.ram ? `${log.ram} GB` : 'N/A'} />
                                    <DetailItem icon={Monitor} label="GPU Info" value={log.gpuInfo} />
                                </dl>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs text-muted-foreground break-all bg-muted p-2 rounded-md">
                                    <span className="font-semibold">User Agent:</span> {log.userAgent}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-12">No login activity recorded.</p>
            )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
