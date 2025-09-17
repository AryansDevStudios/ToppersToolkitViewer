
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
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
                You do not have permission to view this page. Please contact an administrator to request access.
            </p>
            <Button asChild className="mt-6">
                <Link href="/">Back to Home</Link>
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

export default function DoubtSolverPage() {
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

        if (dbUser.role === 'Admin' || dbUser.hasAiAccess !== false) {
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

        const name = encodeURIComponent(dbUser.name || (dbUser.role === 'Teacher' ? 'Teacher' : 'Student'));
        const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
        const base = "https://topperstoolkitai.netlify.app/";

        if (dbUser.role === 'Teacher') {
            const gender = encodeURIComponent(dbUser.gender || 'N/A');
            return `${base}?name=${name}&class=Teacher&theme=${theme}&gender=${gender}`;
        } else {
            const studentClass = encodeURIComponent(dbUser.classAndSection || 'N/A');
            return `${base}?name=${name}&class=${studentClass}&theme=${theme}`;
        }
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
                title="Doubt Solver"
                allowFullScreen
                allow="clipboard-write"
            >
            </iframe>
        </div>
    );
}
