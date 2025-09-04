
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
            <h2 className="text-2xl font-bold">Verifying Access...</h2>
            <p className="mt-2 text-muted-foreground">Please wait while we check your permissions.</p>
        </div>
   </div>
);

export default function DoubtSolverPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { resolvedTheme } = useTheme();
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
            
            if (dbUser?.role === 'Admin' || dbUser?.hasAiAccess !== false) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        }

        checkAccess();
    }, [authLoading, user, router]);

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
        if (!userData) return "";

        const name = encodeURIComponent(userData.name || (userData.role === 'Teacher' ? 'Teacher' : 'Student'));
        const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
        const base = "https://topperstoolkitai.netlify.app/";

        if (userData.role === 'Teacher') {
            const gender = encodeURIComponent(userData.gender || 'N/A');
            return `${base}?name=${name}&class=Teacher&theme=${theme}&gender=${gender}`;
        } else if (userData.role === 'Ethic Learner') {
             return `${base}?name=${name}&class=ethic-learner&theme=${theme}`;
        } else {
            const studentClass = encodeURIComponent(userData.classAndSection || 'N/A');
            return `${base}?name=${name}&class=${studentClass}&theme=${theme}`;
        }
    };
    
    const iframeUrl = getIframeUrl();
    const iframeKey = `${user?.uid}-${resolvedTheme}`;

    if (hasAccess === null || !userData) {
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
