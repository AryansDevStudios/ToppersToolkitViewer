
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
const subscriptionPaths = ['/subscribe', '/subscription-confirmation'];

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
    '/pricing',
    '/our-teachers',
    '/youtube-learning',
    '/current-affairs',
    '/subscription-history',
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
      setAccessState('loading'); 
      return;
    }
    
    const isOpenPage = authenticatedOpenPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path))) || subscriptionPaths.some(path => pathname.startsWith(path));
    const isProtectedPage = !isOpenPage;

    if (isProtectedPage) {
      const hasActiveSubscription = dbUser.hasFullNotesAccess === true;
      const isDemoActive = dbUser.demoExpiresAt ? dbUser.demoExpiresAt > Date.now() : false;
      const isAdmin = dbUser.role === 'Admin';
      
      const hasAccess = hasActiveSubscription || isDemoActive || isAdmin;

      if (!hasAccess) {
        setAccessState('denied');
        return;
      }
    }
    
    setAccessState('granted');
    
  }, [loading, user, dbUser, pathname, router]);

  if (accessState === 'loading') {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
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
  const isSubscriptionFlowPage = subscriptionPaths.some(path => pathname.startsWith(path));

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
          localStorage.clear();
          sessionStorage.clear();

          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
          }

          toast({
            title: "Cache Cleared",
            description: "All site caches have been cleared. The page will now reload.",
          });

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
      <div className="relative flex min-h-screen flex-col">
        {!isAuthPage && !isSubscriptionFlowPage && <AppHeader />}
        <main className="flex-1 flex flex-col">
          <AuthWrapper initialUser={user}>
            {children}
          </AuthWrapper>
        </main>
        <SubscriptionStatusDialog />
        {!isAuthPage && !isDoubtSolverPage && !isSubscriptionFlowPage && <Footer />}
        {!isAuthPage && !isSubscriptionFlowPage && <MobileBottomNav />}
      </div>
    </ThemeProvider>
  );
}
