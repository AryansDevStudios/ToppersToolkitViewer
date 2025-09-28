
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

  useEffect(() => {
    if (loading) return;

    const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
    const isSubscriptionPage = subscriptionPaths.some(path => pathname.startsWith(path));

    if (!user && !isPublicPage && !isSubscriptionPage) {
      router.push('/login');
      return;
    }
    
  }, [loading, user, dbUser, pathname, router]);

  const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
  const isSubscriptionPage = subscriptionPaths.some(path => pathname.startsWith(path));

  if (loading && !isPublicPage && !isSubscriptionPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user && !isPublicPage && !isSubscriptionPage) {
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
