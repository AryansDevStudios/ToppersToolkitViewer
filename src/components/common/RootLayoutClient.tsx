
"use client";

import React, { useEffect, useState } from 'react';
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
    '/quiz-results',
    '/about-us',
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
  const [isAccessChecked, setIsAccessChecked] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
    if (isPublicPage) {
      setIsAccessChecked(true);
      return; 
    }

    if (!user || !dbUser) {
      router.push('/login');
      // Access check is "complete" in the sense that a redirect is happening
      // We don't set to true, to avoid a flash of the login page behind the loader
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
        toast({
            title: "Subscription Required",
            description: "You need an active subscription to access this page.",
            variant: "destructive"
        });
        router.push('/pricing');
        // Redirecting, so access check is "done" for this path.
        // We don't set to true, to avoid flash of content on the pricing page.
        return;
      }
    }
    
    // If we reach here, the user has access to the page.
    setIsAccessChecked(true);
    
  }, [loading, user, dbUser, pathname, router, toast]);

  const isPublicPage = publicPaths.some(path => pathname.startsWith(path));

  // If the page isn't public and we haven't finished the access check, show a loader.
  if (!isPublicPage && !isAccessChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render children only if access is checked and granted, or if it's a public page.
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
