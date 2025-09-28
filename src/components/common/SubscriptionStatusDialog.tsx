
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
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader className="items-center text-center">
          <ShieldAlert className="h-14 w-14 text-destructive mb-2" />
          <AlertDialogTitle className="text-2xl">
            Demo Period Expired
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Your free demo has ended. To continue enjoying unlimited access to all notes and features, please subscribe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center pt-4 gap-3 sm:gap-4">
          <AlertDialogCancel>Continue Browsing</AlertDialogCancel>
          <AlertDialogAction onClick={handleActionClick} className="bg-primary hover:bg-primary/90">
            <Star className="mr-2 h-4 w-4" />
            View Subscription Plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
