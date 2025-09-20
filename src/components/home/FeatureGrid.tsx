
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

const features = [
  {
    title: 'Leaderboard',
    icon: 'Swords',
    href: '/leaderboard',
  },
  {
    title: 'Puzzle & Quiz',
    icon: 'Puzzle',
    href: '/puzzle-quiz',
  },
  {
    title: 'Notices',
    icon: 'ClipboardList',
    href: '/notices',
  },
  {
    title: 'AI Help',
    icon: 'Bot',
    href: '/solve-doubts',
  },
  {
    title: 'Doubt Box',
    icon: 'MessageSquare',
    href: '/doubt-box',
  },
  {
    title: 'About Us',
    icon: 'Users',
    href: '/about-us',
  },
  {
    title: 'Telegram Chat',
    icon: 'Send',
    href: 'https://t.me/+BP99uVTapfw3YmY1',
    isExternal: true,
  },
  {
    title: 'GS MCQs',
    icon: 'BookCheck',
    href: '/mcqs',
  },
  {
    title: 'Mindmap',
    icon: 'BrainCircuit',
    href: '/mindmap',
  },
    {
    title: 'GS Preparation',
    icon: 'BookCheck',
    href: '/mcqs',
  },
  {
    title: 'Complaints',
    icon: 'FileQuestion',
    href: '/complaints',
  },
  {
    title: 'Reasoning',
    icon: 'BrainCircuit',
    href: '/reasoning',
  },
];

export function FeatureGrid() {
  return (
    <section className="w-full py-12">
      <div className="container px-4">
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto md:gap-6 lg:gap-8">
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
                  <CardContent className="p-4 flex flex-col items-center justify-center aspect-square">
                    <div className="bg-primary/10 text-primary p-4 rounded-lg mb-3 md:p-5">
                      <Icon className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <CardTitle className="text-sm md:text-base font-semibold text-center truncate">
                      {feature.title}
                    </CardTitle>
                  </CardContent>
                </Card>
              </LinkComponent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
