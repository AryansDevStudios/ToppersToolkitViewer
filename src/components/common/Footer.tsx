
import { Mail, Send, Smartphone } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-card border-t py-4 px-4 pb-20 md:pb-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Topper's Toolkit. Products by Kuldeep Singh.</p>
          <p className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent inline-block font-semibold">Website built under AryansDevStudios.</p>
        </div>
    </footer>
  );
}
