import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubjects } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const subjects = await getSubjects();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Welcome to Topper's Toolkit
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Your ultimate resource for comprehensive academic notes. Dive into any subject to start your learning journey.
        </p>
        <Button asChild className="mt-8 group" size="lg">
            <Link href="#subjects">
                Browse Subjects
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
        </Button>
      </header>

      <section id="subjects">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <Link
              href={`/browse/${subject.id}`}
              key={subject.id}
              className="block hover:no-underline group"
            >
              <Card className="h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus-visible:-translate-y-2 focus-visible:shadow-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <CardHeader className="flex-row items-center gap-4 p-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <subject.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {subject.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-muted-foreground text-sm">
                    Explore all materials and notes for {subject.name}.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
