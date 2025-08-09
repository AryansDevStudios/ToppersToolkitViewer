"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole } from '@/lib/data';
import type { User } from '@/lib/types';

interface ChangeRoleMenuItemProps {
    userId: string;
    currentRole: User['role'];
}

// This component is currently not used because user management is disabled.
export function ChangeRoleMenuItem({ userId, currentRole }: ChangeRoleMenuItemProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const newRole = currentRole === 'Admin' ? 'User' : 'Admin';

    const handleChangeRole = () => {
        startTransition(async () => {
            const result = await updateUserRole(userId, newRole);

            if (result.success) {
                toast({
                    title: "Role Updated",
                    description: `User role has been changed to ${newRole}.`,
                });
                router.refresh();
            } else {
                toast({
                    title: "Update Failed",
                    description: result.error || "Could not update user role.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <DropdownMenuItem onClick={handleChangeRole} disabled={true}>
            {`Make ${newRole}`}
        </DropdownMenuItem>
    )
}
