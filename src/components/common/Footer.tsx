
import { Mail, Send, Smartphone } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-card mt-12 border-t">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-black mb-2">Topper's Toolkit Library</h3>
            <p className="text-muted-foreground text-sm">This website is for viewing purchased digital study materials. All notes (PDFs) are accessible exclusively through your E-Library account after purchase from our <a href="https://topperstoolkit.netlify.app" className="text-primary font-semibold hover:underline">Shop</a> website.</p>
             <div className="mt-4">
                <Link href="/terms" className="text-sm text-primary underline underline-offset-4 hover:opacity-80 transition-opacity">
                    Terms & Conditions
                </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 justify-center md:justify-start">
                 <Mail className="h-4 w-4" />
                 <a href="mailto:kuldeepsingh012011@gmail.com" className="hover:text-primary">
                    kuldeepsingh012011@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <Smartphone className="h-4 w-4" />
                <a href="https://wa.me/917754000411" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  WhatsApp: +91 77540 00411
                </a>
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <Send className="h-4 w-4" />
                 <a href="https://t.me/topperstoolkit" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Telegram: @topperstoolkit
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Topper's Toolkit Library. Products by Kuldeep Singh.</p>
          <p>Website built under AryansDevStudios.</p>
        </div>
      </div>
    </footer>
  );
}
