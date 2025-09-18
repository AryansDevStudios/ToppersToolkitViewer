
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lightbulb, Code, BookCopy } from 'lucide-react';
import Image from 'next/image';
import { teachers } from '@/lib/teachers';
import type { TeacherProfile } from '@/lib/teachers';

const MissionCard = () => (
    <Card className="bg-primary/5 border-primary/20 shadow-lg">
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Lightbulb className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl text-primary">Our Mission</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-lg text-foreground">
                Our goal is to revolutionize education by blending high-quality, curated content with cutting-edge technology. We aim to empower students with the tools they need to study smarter, overcome challenges, and achieve academic excellence.
            </p>
        </CardContent>
    </Card>
);

const CreatorCard = ({ creator }: { creator: TeacherProfile }) => (
    <Card className="overflow-hidden flex flex-col">
        <div className="relative aspect-[4/3] w-full">
            <Image
                src={creator.photoUrl}
                alt={`Photo of ${creator.name}`}
                fill
                className="object-cover"
                data-ai-hint="portrait"
            />
        </div>
        <CardHeader>
            <CardTitle className="text-xl">{creator.name}</CardTitle>
            <p className="text-md font-semibold text-primary">{creator.subject}</p>
        </CardHeader>
        <CardContent className="flex-1">
             {creator.about.map((paragraph, index) => (
                <p key={index} className="text-muted-foreground text-sm mb-3 last:mb-0">
                    {paragraph}
                </p>
            ))}
        </CardContent>
    </Card>
);


export default function AboutUsPage() {
  const kuldeep = teachers.find(t => t.id === 'kuldeep-singh');
  const aryan = teachers.find(t => t.id === 'aryan-gupta');

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Users className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          The Team Behind Topper's Toolkit
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Meet the minds dedicated to creating a better learning experience for students everywhere.
        </p>
      </header>
      
      <main className="space-y-16">
        <section>
            <MissionCard />
        </section>

        <section>
            <h2 className="text-3xl font-bold text-center mb-8">Our Creators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {kuldeep && <CreatorCard creator={kuldeep} />}
                {aryan && <CreatorCard creator={aryan} />}
            </div>
        </section>
      </main>
    </div>
  );
}
