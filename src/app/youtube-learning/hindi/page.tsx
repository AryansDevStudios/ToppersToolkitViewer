
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { iconMap } from '@/lib/iconMap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const HindiIcon = iconMap['BookOpen'];

export default function HindiYoutubePage() {
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
          <HindiIcon className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Hindi Learning Videos
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Curated YouTube videos to help you with your Hindi studies.
        </p>
      </header>
      <main className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    We are currently selecting the best videos for this subject. Please check back later!
                </p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
