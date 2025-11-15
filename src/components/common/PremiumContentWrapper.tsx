"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const AccessDenied = () => (
    <div className="container mx-auto px-4 py-8">
        <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4 border rounded-lg bg-background">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
                This feature is available for subscribers only. Please subscribe to gain full access.
            </p>
            <Button asChild className="mt-6">
                <Link href="/pricing">
                  <Star className="mr-2 h-4 w-4" />
                  View Subscription Plans
                </Link>
            </Button>
        </div>
    </div>
);

const LoadingState = () => (
   <div className="container mx-auto px-4 py-8">
    <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold">Verifying Access...</h2>
            <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
        </div>
   </div>
);


export function PremiumContentWrapper({ children }: { children: React.ReactNode }) {
    const { dbUser, loading } = useAuth();
    
    if (loading || !dbUser) {
        return <LoadingState />;
    }
    
    const hasActiveSubscription = dbUser.hasFullNotesAccess === true;
    const isDemoActive = dbUser.demoExpiresAt ? dbUser.demoExpiresAt > Date.now() : false;

    const hasAccess = hasActiveSubscription || isDemoActive;

    if (!hasAccess) {
        return <AccessDenied />;
    }

    return <>{children}</>;
}
