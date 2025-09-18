
import { Mail, Send, Smartphone } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-card mt-12 border-t pb-20 md:pb-0">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 text-center">
          <div>
            <h3 className="text-lg font-black mb-2">Topper's Toolkit</h3>
             <div className="mt-4 space-x-4">
                <Link href="/terms" className="text-sm text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
                    Terms & Conditions
                </Link>
                <Link href="/user-manual" className="text-sm text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
                    User Manual
                </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Topper's Toolkit. Products by Kuldeep Singh.</p>
          <p className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent inline-block font-semibold">Website built under AryansDevStudios.</p>
        </div>
      </div>
    </footer>
  );
}
