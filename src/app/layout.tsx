
"use client";

import { AppHeader } from "@/components/common/Header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Footer } from "@/components/common/Footer";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            {!isAuthPage && <AppHeader />}
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            {!isAuthPage && <Footer />}
            {!isAuthPage && <MobileBottomNav />}
          </div>
          <Toaster />
        </ThemeProvider>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          inter.variable
        )}
      >
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
