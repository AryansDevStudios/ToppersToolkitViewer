
import { teachers } from "@/lib/teachers";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookUser } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Our Teachers - Topper's Toolkit Library",
    description: "Meet the dedicated educators behind Topper's Toolkit.",
};

export default function OurTeachersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
            <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
                <BookUser className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                Meet Our Teachers
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The dedicated and inspiring educators who make learning an adventure.
            </p>
        </header>

        <main>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {teachers.map((teacher) => (
                    <Card key={teacher.id} className="overflow-hidden group flex flex-col">
                        <Link href={`/our-teachers/${teacher.id}`} className="block">
                             <div className="relative aspect-square overflow-hidden">
                                <img
                                    src={teacher.photoUrl}
                                    alt={`Photo of ${teacher.name}`}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    data-ai-hint="teacher portrait"
                                />
                            </div>
                        </Link>
                        <CardContent className="p-6 flex-1 flex flex-col">
                            <h2 className="text-2xl font-bold mb-1">{teacher.name}</h2>
                            <p className="text-primary font-semibold mb-4">{teacher.subject}</p>
                            <p className="text-muted-foreground text-sm italic flex-1">
                                &ldquo;{teacher.quote}&rdquo;
                            </p>
                        </CardContent>
                        <CardFooter className="p-4 bg-muted/50">
                            <Button asChild className="w-full" variant="outline">
                                <Link href={`/our-teachers/${teacher.id}`}>
                                    View Full Profile <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    </div>
  )
}
