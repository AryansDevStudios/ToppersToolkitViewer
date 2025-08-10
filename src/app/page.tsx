import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubjects } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book } from "lucide-react";
import { iconMap } from "@/lib/iconMap";

export default async function Home() {
  const subjects = await getSubjects();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-card to-background">
          <div className="container px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 font-headline">
              Unlock Your Academic Potential
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mt-4">
              High-quality, chapter-wise notes designed for academic excellence. Dive into any subject and start your journey to becoming a topper.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="#subjects">
                  Browse Subjects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/browse">
                  See Latest Notes
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="subjects" className="w-full py-16 md:py-24">
            <div className="container px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Browse by Subject</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {subjects.map((subject) => {
                    const Icon = iconMap[subject.icon] || Book;
                    return (
                    <Link
                      href={`/browse/${subject.id}`}
                      key={subject.id}
                      className="block hover:no-underline group"
                    >
                      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-accent/40">
                         <CardHeader>
                            <div className="p-4 bg-primary/10 rounded-lg self-start">
                                <Icon className="h-8 w-8 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                          <CardTitle className="text-xl font-bold mb-2">{subject.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mb-4 h-10">
                            {subject.subSubjects.map(s => s.name).join(', ')}
                          </p>
                          <div className="flex items-center text-sm font-semibold text-primary/80">
                            <span className="group-hover:text-primary transition-colors">View Chapters</span>
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )})}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
