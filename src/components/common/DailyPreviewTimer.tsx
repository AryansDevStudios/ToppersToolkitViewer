
"use client";

import { Clock } from "lucide-react";

interface DailyPreviewTimerProps {
    timeLeft: number;
}

export function DailyPreviewTimer({ timeLeft }: DailyPreviewTimerProps) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="sticky top-16 z-40 w-full bg-destructive text-destructive-foreground p-2 text-center text-sm font-semibold flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Daily Preview Time Remaining: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
    );
}
