
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Swords,
  Puzzle,
  ClipboardList,
  MessageSquare,
  Users,
  Bot,
  Send,
  BrainCircuit,
  FileQuestion,
  BookCheck,
} from 'lucide-react';
import { iconMap } from '@/lib/iconMap';
import placeholderImages from '@/lib/placeholder-images.json';

const features = [
  {
    title: 'Leaderboard',
    icon: 'Swords',
    href: '/leaderboard',
    image: placeholderImages.leaderboard,
  },
  {
    title: 'Puzzle',
    icon: 'Puzzle',
    href: '/puzzle',
    image: placeholderImages.puzzle,
  },
  {
    title: 'Quiz',
    icon: 'FileQuestion',
    href: '/quiz',
    image: placeholderImages.quiz,
  },
  {
    title: 'Notices',
    icon: 'ClipboardList',
    href: '/notices',
    image: placeholderImages.notices,
  },
  {
    title: 'AI Help',
    icon: 'Bot',
    href: '/solve-doubts',
    image: placeholderImages.ai_help,
  },
  {
    title: 'Doubt Box',
    icon: 'MessageSquare',
    href: '/doubt-box',
    image: placeholderImages.doubt_box,
  },
  {
    title: 'About Us',
    icon: 'Users',
    href: '/about-us',
    image: placeholderImages.about_us,
  },
  {
    title: 'Telegram Chat',
    icon: 'Send',
    href: 'https://t.me/topperstoolkit',
    isExternal: true,
    image: placeholderImages.telegram_chat,
  },
  {
    title: 'MCQs',
    icon: 'BookCheck',
    href: '/mcqs',
    image: placeholderImages.mcqs,
  },
  {
    title: 'Mindmap',
    icon: 'BrainCircuit',
    href: '/mindmap',
    image: placeholderImages.mindmap,
  },
];

export function FeatureGrid() {
  return (
    <section className="w-full py-12">
      <div className="container px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || Puzzle;
            const LinkComponent = feature.isExternal ? 'a' : Link;
            return (
              <LinkComponent
                key={feature.title}
                href={feature.href}
                {...(feature.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group block"
              >
                <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-square w-full bg-cover bg-center" style={{backgroundImage: `url(${feature.image.src})`}} data-ai-hint={feature.image['data-ai-hint']}>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Icon className="h-5 w-5" />
                       </div>
                       <CardTitle className="text-base font-semibold truncate">
                        {feature.title}
                       </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              </LinkComponent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
