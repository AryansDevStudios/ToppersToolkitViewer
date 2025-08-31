
import { teachers } from "@/lib/teachers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface TeacherProfilePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: TeacherProfilePageProps): Promise<Metadata> {
  const teacher = teachers.find((t) => t.id === params.id);

  if (!teacher) {
    return {
      title: "Teacher Not Found",
    };
  }

  return {
    title: `${teacher.name} - Topper's Toolkit Library`,
    description: `Learn more about ${teacher.name}, our ${teacher.subject}.`,
  };
}

export default function TeacherProfilePage({ params }: TeacherProfilePageProps) {
  const teacher = teachers.find((t) => t.id === params.id);

  if (!teacher) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
        <Button asChild variant="outline" size="sm" className="mb-8">
            <Link href="/our-teachers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Teachers
            </Link>
        </Button>
        <main>
            <Card className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <img
                            src={teacher.photoUrl}
                            alt={`Profile of ${teacher.name}`}
                            className="object-cover w-full h-full min-h-[300px]"
                            data-ai-hint="teacher portrait"
                        />
                    </div>
                    <div className="md:col-span-2 p-8 flex flex-col">
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{teacher.name}</h1>
                        <p className="text-xl font-semibold text-primary mt-1 mb-6">{teacher.subject}</p>
                        
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-6">
                            {teacher.quote}
                        </blockquote>

                        <div className="text-card-foreground space-y-4">
                            {teacher.about.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </main>
    </div>
  );
}

export async function generateStaticParams() {
    return teachers.map((teacher) => ({
        id: teacher.id,
    }));
}
