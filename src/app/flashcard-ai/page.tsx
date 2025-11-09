
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { User } from "@/lib/types";

const AccessDenied = () => (
    <div className="container mx-auto px-4 py-8">
        <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4 border rounded-lg bg-background">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
                This feature is available for subscribers only. Please subscribe to gain access.
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
    <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4 border rounded-lg bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold">Loading Content...</h2>
            <p className="mt-2 text-muted-foreground">Please wait while we load your content.</p>
        </div>
   </div>
);

export default function FlashcardAIPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (authLoading || !dbUser) {
            return;
        }

        if (dbUser.role === 'Admin' || dbUser.hasFullNotesAccess === true) {
            setHasAccess(true);
        } else {
            setHasAccess(false);
        }

    }, [authLoading, user, dbUser, router]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data === 'inputFocused') {
                document.body.classList.add('hide-mobile-nav');
            } else if (event.data === 'inputBlurred') {
                document.body.classList.remove('hide-mobile-nav');
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.body.classList.remove('hide-mobile-nav');
        };
    }, []);

    const getIframeUrl = () => {
        if (!dbUser) return "";
        const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
        return `https://flashcardaigen.netlify.app/?theme=${theme}`;
    };
    
    const iframeUrl = getIframeUrl();
    const iframeKey = `${user?.uid}-${resolvedTheme}`;

    if (authLoading || hasAccess === null) {
        return <LoadingState />;
    }
    
    if (!hasAccess) {
         return <AccessDenied />;
    }

    return (
        <div className="flex-1 flex flex-col min-h-[calc(100vh_-_4rem_+_10px)]">
            <iframe
                key={iframeKey}
                src={iframeUrl}
                className="w-full border-0 flex-1 h-full"
                title="Flashcard AI"
                allowFullScreen
                allow="clipboard-write"
            >
            </iframe>
        </div>
    );
}
