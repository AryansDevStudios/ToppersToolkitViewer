
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

function AuthWrapper({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const { user, loading } = useAuth(initialUser);
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = publicPaths.some(path => pathname.startsWith(path));
  
  useEffect(() => {
    // This effect handles client-side redirection for users who log out
    // or whose sessions expire.
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [loading, user, isPublicPage, router]);

  // While the initial auth state is being determined on the client for the very first time,
  // and we are not on a public page, show a loader. `initialUser` from SSR prevents this on first load.
  if (loading && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If we've determined the user is not authenticated and it's a protected page, render null.
  // The useEffect above will handle the redirect. This prevents showing protected content.
  if (!user && !isPublicPage) {
    return null; 
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

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthWrapper initialUser={user}>
        <div className="relative flex min-h-screen flex-col">
          {!isAuthPage && <AppHeader />}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          {!isAuthPage && !isDoubtSolverPage && <Footer />}
          {!isAuthPage && <MobileBottomNav />}
        </div>
      </AuthWrapper>
    </ThemeProvider>
  );
}
