
"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, GoogleAuthProvider, signInWithCredential } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const idToken = searchParams.get('id_token');

    if (idToken) {
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential)
        .then(() => {
          toast({
            title: "Sign In Successful",
            description: "Welcome back!",
          });
          router.push('/'); // Redirect to home page on success
        })
        .catch((error) => {
          console.error("Firebase sign-in error:", error);
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive",
          });
          router.push('/login'); // Redirect to login on failure
        });
    } else {
        toast({
            title: "Authentication Error",
            description: "Could not get authentication details from Google.",
            variant: "destructive",
        });
        router.push('/login');
    }
  }, [searchParams, router, toast]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Finalizing authentication, please wait...</p>
        </div>
    </div>
  );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallback />
        </Suspense>
    )
}
