
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
    '/about-us',
    '/quiz-results',
];
const subscriptionPaths = ['/subscribe', '/subscription-confirmation', '/pricing'];

function AuthWrapper({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const { user, dbUser, loading } = useAuth(initialUser);
  const pathname = usePathname();
  const router = useRouter();

  const isLoading = loading && !dbUser;
  
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
    if (isPublicPage) {
      return;
    }

    if (!user || !dbUser) {
      router.push('/login');
      return;
    }

    const hasActiveSubscription = dbUser.hasFullNotesAccess === true;
    const hasDemo = !!dbUser.demoExpiresAt;
    const isNewUserWithoutPlan = !hasActiveSubscription && !hasDemo;
    const isSubscriptionPage = subscriptionPaths.some(path => pathname.startsWith(path));

    if (isNewUserWithoutPlan && !isSubscriptionPage) {
        router.push('/pricing');
    }
  }, [isLoading, user, dbUser, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
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
