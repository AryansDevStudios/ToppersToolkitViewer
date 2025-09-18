
import { Suspense } from "react";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 0; 

function ContactSection() {
  const contactMethods = [
    { name: 'Email', value: 'kuldeepsingh012011@gmail.com', href: 'mailto:kuldeepsingh012011@gmail.com' },
    { name: 'WhatsApp', value: '+91 77540 00411', href: 'https://wa.me/917754000411' },
    { name: 'Telegram', value: 'Topper\'s Toolkit Channel', href: 'https://t.me/+BP99uVTapfw3YmY1' },
  ];

  return (
    <section className="w-full py-12 md:py-16">
        <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
                <p className="mt-2 text-muted-foreground">Have questions? We're here to help.</p>
            </div>
            <div className="mt-8 max-w-sm mx-auto grid gap-4">
                {contactMethods.map((method) => (
                    <a
                      key={method.name}
                      href={method.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                        <Card className="hover:bg-accent hover:border-primary/50 transition-colors">
                            <CardContent className="p-4">
                                <p className="font-semibold text-base">{method.name}</p>
                                <p className="text-sm text-primary">{method.value}</p>
                            </CardContent>
                        </Card>
                    </a>
                ))}
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
