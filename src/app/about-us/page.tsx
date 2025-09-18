
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lightbulb, Code, BookCopy } from 'lucide-react';
import Image from 'next/image';
import { teachers } from '@/lib/teachers';
import type { TeacherProfile } from '@/lib/teachers';
import { iconMap } from '@/lib/iconMap';
import type { LucideIcon } from 'lucide-react';

const features: { title: string; icon: keyof typeof iconMap, description: string }[] = [
    { title: 'Leaderboard', icon: 'Swords', description: 'Compete with peers and track your progress. Stay motivated by climbing ranks as you solve quizzes, puzzles, and practice tests.' },
    { title: 'Puzzle & Quiz', icon: 'Puzzle', description: 'Sharpen your mind with interactive puzzles and quizzes. A fun way to learn, test knowledge, and boost problem-solving skills.' },
    { title: 'Notices', icon: 'ClipboardList', description: 'Stay updated with important announcements, events, and academic reminders — all in one place.' },
    { title: 'AI Help', icon: 'Bot', description: 'Get instant answers and explanations powered by AI. Perfect for quick clarifications and 24/7 study support.' },
    { title: 'Doubt Box', icon: 'MessageSquare', description: 'Ask your questions directly and get reliable answers from admins or mentors. A safe space to clear academic doubts.' },
    { title: 'About Us', icon: 'Users', description: 'Learn about our mission to simplify learning and provide quality study materials for every student.' },
    { title: 'Telegram Chat', icon: 'Send', description: 'Join the student community on Telegram. Discuss topics, share knowledge, and stay connected with peers.' },
    { title: 'MCQs', icon: 'BookCheck', description: 'Practice multiple-choice questions across subjects. Build accuracy and confidence for exams with instant feedback.' },
    { title: 'Mindmaps', icon: 'BrainCircuit', description: 'Visualize topics with mindmaps for better retention. A powerful tool to organize and revise complex concepts easily.' },
];

const FeatureItem = ({ title, icon: Icon, description }: { title: string, icon: LucideIcon, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary rounded-lg p-3">
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const PlatformCard = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <BookCopy className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">About Our Platform</CardTitle>
            </div>
             <p className="text-muted-foreground pt-2">
                Topper's Toolkit Library is a dedicated platform designed to provide students with high-quality study materials in a secure and user-friendly environment. Our purpose is to help you access the resources you need to excel in your studies, all in one place. Here's what you can do:
            </p>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {features.map(feature => {
                    const Icon = iconMap[feature.icon] || BookCopy;
                    return (
                        <FeatureItem key={feature.title} title={feature.title} icon={Icon} description={feature.description} />
                    )
                })}
            </div>
        </CardContent>
    </Card>
);

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
            <PlatformCard />
        </section>

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
