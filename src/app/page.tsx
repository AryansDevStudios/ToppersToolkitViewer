
import { Suspense } from "react";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Send, Smartphone, Instagram } from "lucide-react";
import { Testimonials } from "@/components/home/Testimonials";

export const revalidate = 0;

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <path d="M10.8,8.2V15c0,0.4,0.5,0.6,0.8,0.4l5.4-3.4c0.3-0.2,0.3-0.6,0-0.8l-5.4-3.4C11.3,7.6,10.8,7.9,10.8,8.2z M21.7,8.1 c-0.2-0.8-0.8-1.4-1.6-1.6C18.6,6,12,6,12,6s-6.6,0-8.1,0.5C3.1,6.7,2.5,7.3,2.3,8.1C1.8,9.7,1.8,12,1.8,12s0,2.3,0.5,3.9 c0.2,0.8,0.8,1.4,1.6,1.6C5.4,18,12,18,12,18s6.6,0,8.1-0.5c0.8-0.2,1.4-0.8,1.6-1.6c0.5-1.6,0.5-3.9,0.5-3.9S22.2,9.7,21.7,8.1z"/>
  </svg>
);


function ContactSection() {
  const contactMethods = [
    { name: 'YouTube', href: 'https://youtube.com/@toppers_toolkit?si=pepc5bT3zMCULfGY', icon: YoutubeIcon },
    { name: 'Whatsapp Channel', href: 'https://www.whatsapp.com/channel/0029Vb6gXP37j6gDDkugNS2L', icon: Smartphone },
    { name: 'Instagram', href: 'https://instagram.com/your_handle', icon: Instagram },
    { name: 'Telegram Group', href: 'https://t.me/+BP99uVTapfw3YmY1', icon: Send },
    { name: 'Telegram Channel', href: 'https://t.me/ToppersToolkit', icon: Send },
    { name: 'Email', href: 'mailto:kuldeepsingh012011@gmail.com', icon: Mail },
  ];

  return (
    <section className="w-full py-12 md:py-16">
        <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
                <p className="mt-2 text-muted-foreground">Have questions? We're here to help.</p>
            </div>
            <div className="mt-8 max-w-lg mx-auto grid grid-cols-3 sm:grid-cols-6 gap-3">
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

        <Testimonials />

        <ContactSection />
      </main>
    </div>
  );
}
