
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { iconMap } from '@/lib/iconMap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Youtube } from 'lucide-react';
import Image from 'next/image';

const SstIcon = iconMap['Landmark'];

export default function SstYoutubePage() {
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
          <SstIcon className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          SST Learning Videos
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Curated YouTube videos to help you with your Social Studies.
        </p>
      </header>
      <main className="max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Digraj Singh Rajput</CardTitle>
                <CardDescription>A popular educator for Social Studies, making learning engaging and fun.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/3">
                    <Image 
                        src="https://yt3.googleusercontent.com/pCuxvLAGBdSiUnP94Te7NBm06VwR6Q9bqwxRiI9CfV7HEMl5ornA0w0hQH1wz13mZa4VwWxegJQ=s900-c-k-c0x00ffffff-no-rj"
                        alt="Photo of Digraj Singh Rajput"
                        width={400}
                        height={400}
                        className="rounded-lg object-cover"
                        data-ai-hint="male teacher portrait"
                    />
                </div>
                <div className="md:w-2/3 space-y-4">
                    <p className="text-muted-foreground">
                        Digraj Singh Rajput is well-known for his unique teaching style that simplifies complex topics in History, Geography, Civics, and Economics. His videos are a great resource for students looking to build a strong foundation in Social Studies.
                    </p>
                    <Button asChild>
                        <a href="https://www.youtube.com/@digrajsinghrajput" target="_blank" rel="noopener noreferrer">
                            <Youtube className="mr-2 h-4 w-4" />
                            Visit Channel
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
