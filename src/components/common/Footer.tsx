
"use client";

import { Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This check runs only on the client-side after hydration
    const userAgent = navigator.userAgent;
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
  }, []);

  return (
    <footer className="bg-card border-t py-4 px-4 pb-20 md:pb-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Topper's Toolkit. Owned by Kuldeep Singh.</p>
            <p className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent inline-block font-semibold">Website built under AryansDevStudios.</p>
          </div>
          {isMobile && (
            <>
              <div className="hidden md:block h-10 border-l border-border"></div>
              <Button asChild>
                <a href="https://github.com/AryansDevStudios/ToppersToolkitE-Materials/raw/refs/heads/main/app/android/Topper's%20Toolkit%201.4.0.apk" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download App
                </a>
              </Button>
            </>
          )}
        </div>
    </footer>
  );
}
