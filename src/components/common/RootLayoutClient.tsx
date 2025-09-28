
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

const publicPaths = [
    '/login', 
    '/register', 
    '/terms', 
    '/user-manual',
    '/about-us',
    '/quiz-results',
];
const subscriptionPaths = ['/pricing', '/subscribe', '/subscription-confirmation'];

// Pages accessible to any logged-in user, regardless of subscription
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

function AuthWrapper({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const { user, dbUser, loading } = useAuth(initialUser);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    console.log(`[AuthGuard] Path: ${pathname}`);
    console.log(`[AuthGuard] State: loading=${loading}, user=${!!user}, dbUser=${!!dbUser}`);

    if (loading) {
      console.log('[AuthGuard] Still loading, skipping checks.');
      return;
    }

    const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
    if (isPublicPage) {
      console.log('[AuthGuard] Public page, access granted.');
      return; // Allow access to public pages
    }

    if (!user || !dbUser) {
      console.log('[AuthGuard] User not logged in, redirecting to /login.');
      router.push('/login');
      return;
    }
    
    // User is logged in, check for protected routes
    const isOpenPage = authenticatedOpenPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path))) || subscriptionPaths.some(path => pathname.startsWith(path));
    const isProtectedPage = !isOpenPage;

    console.log(`[AuthGuard] Checks: isPublicPage=${isPublicPage}, isOpenPage=${isOpenPage}, isProtectedPage=${isProtectedPage}`);

    if (isProtectedPage) {
      console.log('[AuthGuard] This is a PROTECTED page. Checking subscription...');
      const hasActiveSubscription = dbUser.hasFullNotesAccess === true;
      const isSubExpired = dbUser.subscriptionExpiresAt ? dbUser.subscriptionExpiresAt < Date.now() : false;
      const isDemoActive = dbUser.demoExpiresAt ? dbUser.demoExpiresAt > Date.now() : false;
      const isAdmin = dbUser.role === 'Admin';

      const finalAccessStatus = hasActiveSubscription && !isSubExpired;

      console.log(`[AuthGuard] User Details: isAdmin=${isAdmin}, hasActiveSub=${finalAccessStatus}, isDemoActive=${isDemoActive}`);

      if (!isAdmin && !finalAccessStatus && !isDemoActive) {
        console.error(`[AuthGuard] ACCESS DENIED. Redirecting to /pricing. User: ${dbUser.email}`);
        toast({
            title: "Subscription Required",
            description: "You need an active subscription to access this page.",
            variant: "destructive"
        });
        router.push('/pricing');
      } else {
        console.log('[AuthGuard] Access GRANTED to protected page.');
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
  
  // If we are still loading but the user object is not available yet for a non-public page,
  // we show a loader to prevent a flash of content.
  if (!user && !isPublicPage) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
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
