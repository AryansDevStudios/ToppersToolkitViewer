
"use client";

import { AppHeader } from "@/components/common/Header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Footer } from "@/components/common/Footer";
import { usePathname, useRouter } from "next/navigation";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { Inter } from 'next/font/google';
import { useAuth } from "@/hooks/use-auth";
import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { User } from "@/lib/types";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const publicPaths = ['/login', '/register', '/terms', '/user-manual', '/quiz-results'];

function AuthWrapper({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const { user, dbUser, loading } = useAuth(initialUser);
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = publicPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [loading, user, isPublicPage, router, pathname]);

  if (loading && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user && !isPublicPage) {
    return null; // Render nothing while redirecting
  }

  return <>{children}</>;
}


function RootLayoutClient({
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
            <Toaster />
          </AuthWrapper>
        </ThemeProvider>
  )
}

// This is the new RootLayout that is a Server Component
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const { getUser } = await import('@/lib/auth-server');
    const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Topper's Toolkit</title>
        <meta name="description" content="Your one-stop destination for academic resources." />
        <meta name="google-site-verification" content="HhYE_EaRl3a-lakYfgYJNTwiSP22eQX_QUafQRqd0nw" />
        <link rel="icon" href="https://topperstoolkit.netlify.app/icon/icon_app.ico" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <RootLayoutClient user={user}>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
