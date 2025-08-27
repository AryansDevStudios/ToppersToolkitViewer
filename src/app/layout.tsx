
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
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const publicPaths = ['/login', '/register', '/terms', '/user-manual'];

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
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


function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
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
          <AuthWrapper>
            <div className="relative flex min-h-screen flex-col">
              {!isAuthPage && <AppHeader />}
               <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
              {!isAuthPage && !isDoubtSolverPage && <Footer />}
              {!isAuthPage && <MobileBottomNav />}
            </div>
            <Toaster />
          </AuthWrapper>
        </ThemeProvider>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDoubtSolverPage = pathname === '/solve-doubts';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Topper's Toolkit Library</title>
        <meta name="description" content="Your one-stop destination for academic resources." />
        <link rel="icon" href="https://raw.githubusercontent.com/AryansDevStudios/ToppersToolkit/main/icon/icon_app_128x128.png" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          { "body-lock": isDoubtSolverPage }
        )}
      >
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
