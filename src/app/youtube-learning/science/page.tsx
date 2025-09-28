
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { iconMap } from '@/lib/iconMap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const ScienceIcon = iconMap['FlaskConical'];

export default function ScienceYoutubePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Button asChild variant="outline" size="sm" className="mb-8">
            <Link href="/youtube-learning">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Subjects
            </Link>
        </Button>
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <ScienceIcon className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Science Learning Videos
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Curated YouTube videos to help you with your Science studies.
        </p>
      </header>
      <main className="max-w-4xl mx-auto">
        <Link href="/youtube-learning/science/prashant-kirad" className="block group">
            <Card className="transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                <CardHeader>
                    <CardTitle className="text-2xl">Prashant Kirad</CardTitle>
                    <CardDescription>A passionate educator known for making science engaging and easy to understand.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-6">
                    <div className="md:w-1/3">
                        <Image 
                            src="https://yt3.googleusercontent.com/ytc/AIdro_n0aUIJ2NeTYJqM5CVT_y-revv2yNlCTJpG00yP1A=s900-c-k-c0x00ffffff-no-rj"
                            alt="Photo of Prashant Kirad"
                            width={400}
                            height={400}
                            className="rounded-lg object-cover"
                            data-ai-hint="male teacher portrait"
                        />
                    </div>
                    <div className="md:w-2/3 space-y-4">
                        <p className="text-muted-foreground">
                            Prashant Kirad's videos are a great resource for students looking to build a strong foundation in Physics, Chemistry, and Biology. His energetic teaching style helps simplify complex topics.
                        </p>
                        <Button>
                            View Videos
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
      </main>
    </div>
  );
}
