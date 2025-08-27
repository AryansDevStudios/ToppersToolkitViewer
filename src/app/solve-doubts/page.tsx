
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserById } from "@/lib/data";
import { useTheme } from "next-themes";
import type { User } from "@/lib/types";

const AccessDenied = () => (
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
);

const LoadingState = () => (
   <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4 border rounded-lg bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">Verifying Access...</h2>
        <p className="mt-2 text-muted-foreground">Please wait while we check your permissions.</p>
    </div>
);

export default function DoubtSolverPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const { theme, resolvedTheme } = useTheme();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (authLoading) {
            return;
        }

        setHasAccess(null); 
        setUserData(null);

        async function checkAccess() {
            if (!user) {
                setHasAccess(false);
                return;
            }

            const dbUser = await getUserById(user.uid);
            setUserData(dbUser);
            
            if (role === 'Admin' || dbUser?.hasAiAccess) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        }

        checkAccess();
    }, [authLoading, user, role, router]);

    const studentName = encodeURIComponent(userData?.name || 'Student');
    const classOfStudent = encodeURIComponent(userData?.classAndSection || 'N/A');
    const siteTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
    
    // Use a key on the iframe that changes when the theme changes to force a re-render
    const iframeKey = `${user?.uid}-${siteTheme}`;

    const iframeUrl = `https://topperstoolkitai.netlify.app/?name=${studentName}&class=${classOfStudent}&theme=${siteTheme}`;

    if (hasAccess === null) {
        return (
            <div className="container mx-auto px-4 py-8">
                <LoadingState />
            </div>
        );
    }
    
    if (!hasAccess) {
         return (
            <div className="container mx-auto px-4 py-8">
                <AccessDenied />
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-muted/20">
            <div className="flex-1 w-full h-full">
                <iframe
                    key={iframeKey}
                    src={iframeUrl}
                    className="w-full h-full border-0"
                    title="Doubt Solver"
                    allowFullScreen
                    allow="clipboard-write"
                >
                </iframe>
            </div>
        </div>
    );
}
