
"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, Star } from 'lucide-react';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { AppHeader } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionStatusDialog } from './SubscriptionStatusDialog';
import { Button } from '../ui/button';
import Link from 'next/link';

const publicPaths = [
    '/login', 
    '/register', 
    '/terms', 
    '/user-manual',
    '/quiz-results',
    '/about-us',
];
const subscriptionPaths = ['/pricing', '/subscribe', '/subscription-confirmation'];

const authenticatedOpenPaths = [
    '/',
    '/browse',
    '/complaints',
    '/doubt-box',
    '/invite-friends',
    '/leaderboard',
    '/notices',
    '/purchase-history',
    '/puzzle-quiz',
    '/rules-policies',
    '/search',
];

const AccessDenied = () => (
    <div className="container mx-auto px-4 py-8">
        <div className="w-full h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center p-4 border rounded-lg bg-background">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-destructive">
                 Access Denied
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md">
                You do not have permission to view this page. An active subscription is required.
            </p>
            <Button asChild className="mt-6">
                <Link href="/pricing">
                    <Star className="mr-2 h-4 w-4"/>
                    View Subscription Plans
                </Link>
            </Button>
        </div>
    </div>
);

function AuthWrapper({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const { user, dbUser, loading } = useAuth(initialUser);
  const pathname = usePathname();
  const router = useRouter();
  const [accessState, setAccessState] = useState<'loading' | 'granted' | 'denied'>('loading');

  useEffect(() => {
    if (loading) {
      setAccessState('loading');
      return;
    }

    const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
    if (isPublicPage) {
      setAccessState('granted');
      return; 
    }

    if (!user || !dbUser) {
      router.push('/login');
      // While redirecting, keep it in a loading-like state.
      setAccessState('loading'); 
      return;
    }
    
    const isOpenPage = authenticatedOpenPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path))) || subscriptionPaths.some(path => pathname.startsWith(path));
    const isProtectedPage = !isOpenPage;

    if (isProtectedPage) {
      const hasActiveSubscription = dbUser.hasFullNotesAccess === true;
      const isSubExpired = dbUser.subscriptionExpiresAt ? dbUser.subscriptionExpiresAt < Date.now() : false;
      const isDemoActive = dbUser.demoExpiresAt ? dbUser.demoExpiresAt > Date.now() : false;
      const isAdmin = dbUser.role === 'Admin';

      const finalAccessStatus = hasActiveSubscription && !isSubExpired;

      if (!isAdmin && !finalAccessStatus && !isDemoActive) {
        setAccessState('denied');
        return;
      }
    }
    
    setAccessState('granted');
    
  }, [loading, user, dbUser, pathname, router]);

  if (accessState === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (accessState === 'denied') {
    return <AccessDenied />;
  }

  return <>{children}</>;
}


export function RootLayoutClient({
  children,
  user
}: Readonly<{
  children: React.ReactNode;
  user: User | null;
}>) {
  const pathname = usePathname();
  const { toast } = useToast();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isDoubtSolverPage = pathname === '/solve-doubts';
  const isSubscriptionPage = subscriptionPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    const faviconUrl = "/favicon.ico";
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  }, []);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'q') {
        event.preventDefault();
        
        try {
          // Clear local storage and session storage
          localStorage.clear();
          sessionStorage.clear();

          // Clear service worker caches if any
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
          }

          toast({
            title: "Cache Cleared",
            description: "All site caches have been cleared. The page will now reload.",
          });

          // Force a reload after a short delay to allow toast to appear
          setTimeout(() => {
            window.location.reload();
          }, 1000);

        } catch (error) {
          toast({
            title: "Error",
            description: "Could not clear all caches.",
            variant: "destructive",
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toast]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthWrapper initialUser={user}>
        <div className="relative flex min-h-screen flex-col">
          {!isAuthPage && !isSubscriptionPage && <AppHeader />}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <SubscriptionStatusDialog />
          {!isAuthPage && !isDoubtSolverPage && !isSubscriptionPage && <Footer />}
          {!isAuthPage && !isSubscriptionPage && <MobileBottomNav />}
        </div>
      </AuthWrapper>
    </ThemeProvider>
  );
}
