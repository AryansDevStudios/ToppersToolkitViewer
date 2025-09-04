
"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole } from '@/lib/data';
import type { User } from '@/lib/types';
import { ShieldCheck, UserCheck, GraduationCap, Star } from 'lucide-react';

interface ChangeRoleMenuItemProps {
    userId: string;
    currentRole: User['role'];
}

export function ChangeRoleMenuItem({ userId, currentRole }: ChangeRoleMenuItemProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const handleChangeRole = (newRole: User['role']) => {
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
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <span>Change Role</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleChangeRole('Student')} disabled={isPending || currentRole === 'Student'}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Make Student
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => handleChangeRole('Ethic Learner')} disabled={isPending || currentRole === 'Ethic Learner'}>
                    <Star className="mr-2 h-4 w-4" />
                    Make Ethic Learner
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => handleChangeRole('Teacher')} disabled={isPending || currentRole === 'Teacher'}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Make Teacher
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeRole('Admin')} disabled={isPending || currentRole === 'Admin'}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Make Admin
                </DropdownMenuItem>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}
