
"use client";

import type { Metadata } from "next";
import { AppHeader } from "@/components/common/Header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Footer } from "@/components/common/Footer";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Note: Metadata is still here but use client will make it not work for this component directly.
// We can move it to a server component wrapper if needed, but for now we keep it simple.
// export const metadata: Metadata = {
//   title: "Topper's Toolkit Library",
//   description: "Your one-stop destination for academic resources.",
//   icons: "https://raw.githubusercontent.com/AryansDevStudios/ToppersToolkit/main/icon/icon_app_128x128.png"
// };


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
            <main className="flex-1">{children}</main>
            {!isAuthPage && <Footer />}
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
