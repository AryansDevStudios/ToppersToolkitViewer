
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { KeyRound, Edit } from "lucide-react";
import type { User } from "@/lib/types";
import Link from "next/link";


interface ManageAccessDialogProps {
  user: User;
}

// This component is now just a link.
// The main logic has been moved to ManageAccessForm and the new page.
export function ManageAccessDialog({ user }: ManageAccessDialogProps) {
    return (
        <DropdownMenuItem asChild>
            <Link href={`/admin/users/access/${user.id}`}>
                <KeyRound className="mr-2 h-4 w-4" />
                Manage Access
            </Link>
        </DropdownMenuItem>
    );
}
