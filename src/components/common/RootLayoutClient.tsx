
"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { AppHeader } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionStatusDialog } from './SubscriptionStatusDialog';

const publicPaths = ['/login', '/register', '/terms', '/user-manual', '/quiz-results'];
const subscriptionPaths = ['/pricing', '/subscribe', '/subscription-confirmation'];

// Pages accessible to any logged-in user, regardless of subscription
const authenticatedOpenPaths = [
    '/',
    '/browse',
    '/about-us',
    '/complaints',
    '/doubt-box',
    '/invite-friends',
    '/leaderboard',
    '/mcqs',
    '/notices',
    '/purchase-history',
    '/puzzle-quiz',
    '/rules-policies',
    '/search',
    '/solve-doubts',
    '/terms',
    '/user-manual',
];

function AuthWrapper({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const { user, dbUser, loading } = useAuth(initialUser);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;

    const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
    const isOpenPage = authenticatedOpenPaths.some(path => pathname.startsWith(path)) || subscriptionPaths.some(path => pathname.startsWith(path));
    
    // If not a public page and not an open page, it's a protected page
    const isProtectedPage = !isPublicPage && !isOpenPage;
    
    if (!user && !isPublicPage) {
        // If user is not logged in and it's not a public page, redirect to login
        router.push('/login');
        return;
    }

    if (user && dbUser && isProtectedPage) {
        // User is logged in, now check for subscription status on protected pages
        const hasActiveSubscription = dbUser.hasFullNotesAccess === true;
        const isDemoActive = dbUser.demoExpiresAt ? dbUser.demoExpiresAt > Date.now() : false;
        
        if (!hasActiveSubscription && !isDemoActive && dbUser.role !== 'Admin') {
            toast({
                title: "Subscription Required",
                description: "You need an active subscription to access this page.",
                variant: "destructive"
            });
            router.push('/pricing');
            return;
        }
    }
    
  }, [loading, user, dbUser, pathname, router, toast]);

  const isPublicPage = publicPaths.some(path => pathname.startsWith(path));

  if (loading && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user && !isPublicPage) {
    return null; // or a loading spinner
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
