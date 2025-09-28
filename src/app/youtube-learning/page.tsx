
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { iconMap } from '@/lib/iconMap';

const YoutubeIcon = iconMap['Youtube'];

export default function YouTubeLearningPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <YoutubeIcon className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Learn from YouTube
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Hand-picked educational videos to supplement your learning.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section is under construction. We're curating the best educational YouTube content for you!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
