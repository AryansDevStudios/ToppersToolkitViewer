
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { iconMap } from '@/lib/iconMap';
import Link from 'next/link';

const YoutubeIcon = iconMap['Youtube'];

const subjects = [
  { name: 'Hindi', icon: 'BookOpen', href: '/youtube-learning/hindi' },
  { name: 'English', icon: 'Book', href: '/youtube-learning/english' },
  { name: 'Math', icon: 'Calculator', href: '/youtube-learning/math' },
  { name: 'Science', icon: 'FlaskConical', href: '/youtube-learning/science' },
  { name: 'SST', icon: 'Landmark', href: '/youtube-learning/sst' },
];

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
          Hand-picked educational videos to supplement your learning. Select a subject to begin.
        </p>
      </header>
      <main className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {subjects.map((subject) => {
            const Icon = iconMap[subject.icon as keyof typeof iconMap] || YoutubeIcon;
            return (
              <Link href={subject.href} key={subject.name} className="group block">
                <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="bg-primary/10 text-primary p-4 rounded-lg">
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-left">
                      {subject.name}
                    </CardTitle>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
