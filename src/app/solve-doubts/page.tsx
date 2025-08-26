
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserById } from "@/lib/data";

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
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    // TODO: Replace this with the actual URL you want to display.
    const iframeUrl = "https://example.com";

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (authLoading) {
            return;
        }

        setHasAccess(null); 

        async function checkAccess() {
            if (!user) {
                setHasAccess(false);
                return;
            }

            if (role === 'Admin') {
                setHasAccess(true);
                return;
            }

            const userData = await getUserById(user.uid);
            if (userData?.hasAiAccess) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        }

        checkAccess();
    }, [authLoading, user, role, router]);

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
             <header className="p-4 border-b bg-background">
                <h1 className="text-xl font-bold">AI Doubt Solver</h1>
            </header>
            <div className="flex-1 w-full h-full">
                <iframe
                    src={iframeUrl}
                    className="w-full h-full border-0"
                    title="Doubt Solver"
                    allowFullScreen
                >
                </iframe>
            </div>
        </div>
    );
}
