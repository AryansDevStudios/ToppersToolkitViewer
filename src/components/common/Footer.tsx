
import { Mail, Send, Smartphone } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-card mt-12 border-t">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-black font-headline mb-2">Topper's Toolkit Viewer</h3>
            <p className="text-muted-foreground text-sm">High-quality resources for academic success. All rights reserved.</p>
             <div className="mt-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms & Conditions
                </Link>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-semibold font-headline mb-2">Contact Owner</h3>
             <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href="mailto:aryan0106gupta@gmail.com" className="hover:text-primary">
                        aryan0106gupta@gmail.com
                    </a>
                </li>
                 <li className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <a href="https://wa.me/919838040111" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        WhatsApp: +91 98380 40111
                    </a>
                </li>
             </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold font-headline mb-2">Contact Seller</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                 <Mail className="h-4 w-4" />
                 <a href="mailto:kuldeepsingh012011@gmail.com" className="hover:text-primary">
                    kuldeepsingh012011@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <a href="https://wa.me/917754000411" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  WhatsApp: +91 77540 00411
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                 <a href="https://t.me/topperstoolkit" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Telegram: @topperstoolkit
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Topper's Toolkit Viewer. Products by Kuldeep Singh.</p>
          <p>Website built under AryansDevStudios.</p>
        </div>
      </div>
    </footer>
  );
}
