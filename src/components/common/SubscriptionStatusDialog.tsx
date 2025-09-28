
"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { ShieldAlert, Star } from "lucide-react";

const DIALOG_SEEN_KEY = 'subscriptionStatusDialogSeen';

export function SubscriptionStatusDialog() {
  const { dbUser } = useAuth(null);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!dbUser) return;

    const hasSeenDialog = sessionStorage.getItem(DIALOG_SEEN_KEY);
    
    // Condition for demo expiration
    const isDemoExpired = dbUser.demoExpiresAt && dbUser.demoExpiresAt < Date.now();
    const shouldShowDemoExpired = isDemoExpired && !dbUser.hasFullNotesAccess;

    if (shouldShowDemoExpired && !hasSeenDialog) {
        setIsOpen(true);
        sessionStorage.setItem(DIALOG_SEEN_KEY, 'true');
    }

  }, [dbUser]);


  const handleActionClick = () => {
    setIsOpen(false);
    router.push('/pricing');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            Demo Period Expired
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your free demo has ended. To continue enjoying unlimited access to all notes and features, please subscribe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Browsing</AlertDialogCancel>
          <AlertDialogAction onClick={handleActionClick}>
            <Star className="mr-2 h-4 w-4" />
            View Subscription Plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

