
"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole } from '@/lib/data';
import type { User } from '@/lib/types';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface ChangeRoleMenuItemProps {
    userId: string;
    currentRole: User['role'];
}

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
        <DropdownMenuItem onClick={handleChangeRole} disabled={isPending}>
            {newRole === 'Admin' ? <ShieldCheck className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
            {`Make ${newRole}`}
        </DropdownMenuItem>
    )
}
