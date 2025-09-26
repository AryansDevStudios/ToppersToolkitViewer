
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
  
  // This effect will run on the client after the initial render.
  // It ensures that if a user's session expires or they log out, they are redirected.
  // By checking `!loading`, we avoid redirecting during the initial auth state check.
  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [loading, user, isPublicPage, router, pathname]);

  // If we are on the client, still loading the user state, and not on a public page, show a loader.
  // This prevents a flash of content for client-side navigations to protected pages.
  if (loading && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // On the server, or after loading on the client, if the user is not logged in and it's a protected page,
  // we render null. The useEffect above will handle the client-side redirect. This prevents server-rendering
  // protected content for unauthenticated users.
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
