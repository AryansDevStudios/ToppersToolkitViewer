
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
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [loading, user, isPublicPage, router, pathname]);

  // Show loader only on initial load for non-public pages if we don't have an initial user
  if (loading && !isPublicPage && !initialUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not loading, and not a user, and not a public page, we are about to redirect.
  // Render null to avoid a flash of content.
  if (!loading && !user && !isPublicPage) {
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
