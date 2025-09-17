
"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { upsertUser } from "@/lib/data";

interface ToggleLeaderboardSwitchProps {
    userId: string;
    isVisible: boolean;
}

export function ToggleLeaderboardSwitch({ userId, isVisible }: ToggleLeaderboardSwitchProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    // This component is no longer responsible for saving.
    // The parent component `LeaderboardTable` will handle state and saving.
    // This could be further simplified to just be a Switch if all logic moves to the parent.
    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            const result = await upsertUser({
                id: userId,
                showOnLeaderboard: checked,
            });

            if (result.success) {
                toast({
                    title: "Visibility Updated",
                    description: `User will now be ${checked ? 'shown on' : 'hidden from'} the leaderboard.`,
                });
                router.refresh();
            } else {
                 toast({
                    title: "Update Failed",
                    description: result.error || "Could not update visibility.",
                    variant: "destructive",
                });
            }
        });
    };
    
    return (
        <Switch
            checked={isVisible}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label="Toggle user visibility on leaderboard"
        />
    );
}
