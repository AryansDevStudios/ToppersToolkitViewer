import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { getUser } from '@/lib/auth-server';
import { RootLayoutClient } from '@/components/common/RootLayoutClient';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Topper's Toolkit",
  description: 'Your one-stop destination for academic resources.',
  icons: {
    icon: 'https://topperstoolkit.netlify.app/icon/icon_app.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <meta name="google-site-verification" content="HhYE_EaRl3a-lakYfgYJNTwiSP22eQX_QUafQRqd0nw" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <RootLayoutClient user={user}>
          {children}
        </RootLayoutClient>
        <Toaster />
      </body>
    </html>
  );
}
