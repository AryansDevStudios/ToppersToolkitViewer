
import { Suspense } from "react";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Send, Smartphone } from "lucide-react";

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 12 5-3-5-3z" />
  </svg>
);


function ContactSection() {
  const contactMethods = [
    { name: 'Email', href: 'mailto:kuldeepsingh012011@gmail.com', icon: Mail },
    { name: 'WhatsApp', href: 'https://wa.me/917754000411', icon: Smartphone },
    { name: 'Telegram', href: 'https://t.me/+BP99uVTapfw3YmY1', icon: Send },
    { name: 'YouTube', href: 'https://youtube.com/@toppers_toolkit?si=pepc5bT3zMCULfGY', icon: YoutubeIcon }
  ];

  return (
    <section className="w-full py-12 md:py-16">
        <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
                <p className="mt-2 text-muted-foreground">Have questions? We're here to help.</p>
            </div>
            <div className="mt-8 max-w-md mx-auto grid grid-cols-4 gap-3">
                {contactMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                        <a
                          key={method.name}
                          href={method.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                            <Card className="hover:bg-accent hover:border-primary/50 transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 overflow-hidden">
                                <CardContent className="p-3 flex flex-col items-center justify-center aspect-square">
                                    <div className="bg-primary/10 text-primary p-3 rounded-lg mb-2">
                                      <Icon className="h-6 w-6" />
                                    </div>
                                    <p className="font-semibold text-xs text-center">{method.name}</p>
                                </CardContent>
                            </Card>
                        </a>
                    )
                })}
            </div>
        </div>
    </section>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-10 md:py-12">
          <div className="container px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent inline-block">
              Topper's Toolkit
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mt-4 italic">
             "Study Smarter, Score Higher" <br /> -Kuldeep
            </p>
          </div>
        </section>

        <Suspense>
            <FeatureGrid />
        </Suspense>

        <ContactSection />
      </main>
    </div>
  );
}
