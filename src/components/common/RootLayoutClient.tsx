
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

const publicPaths = ['/login', '/register', '/terms', '/user-manual', '/quiz-results'];
const subscriptionPaths = ['/pricing', '/subscribe', '/subscription-confirmation'];

function AuthWrapper({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const { user, dbUser, loading } = useAuth(initialUser);
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
  const isSubscriptionPage = subscriptionPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPage) {
      router.push('/login');
      return;
    }
    
    // Redirect logic for logged-in users
    if (user && dbUser) {
        const hasActiveSubscription = dbUser.hasFullNotesAccess === true;
        const demoExpiresAt = dbUser.demoExpiresAt;
        const hasActiveDemo = demoExpiresAt ? demoExpiresAt > Date.now() : false;
        
        // If user has no subscription and no active demo, and they are on a protected page, redirect to pricing.
        if (!hasActiveSubscription && !hasActiveDemo && !isSubscriptionPage && !isPublicPage) {
            router.push('/pricing');
        }
    }

  }, [loading, user, dbUser, isPublicPage, isSubscriptionPage, router, pathname]);

  if (loading && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If user is not logged in and not on a public page, show loader/null while redirecting
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
          {!isAuthPage && !isDoubtSolverPage && !isSubscriptionPage && <Footer />}
          {!isAuthPage && !isSubscriptionPage && <MobileBottomNav />}
        </div>
      </AuthWrapper>
    </ThemeProvider>
  );
}
