import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSubjects } from "@/lib/data";

export default async function Home() {
  const subjects = await getSubjects();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">
          Welcome to Topper's Toolkit
        </h1>
        <p className="text-lg text-muted-foreground">
          Your comprehensive library of academic notes. Select a subject to
          begin.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {subjects.map((subject) => (
          <Link
            href={`/browse/${subject.id}`}
            key={subject.id}
            className="block hover:no-underline"
          >
            <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:scale-105 focus-visible:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
                  <subject.icon className="w-10 h-10" />
                </div>
                <CardTitle className="font-headline text-2xl">
                  {subject.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground px-6 pb-6">
                <p>
                  Explore materials for {subject.name}.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
