
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { iconMap } from '@/lib/iconMap';
import { cn } from '@/lib/utils';

const features = [
  { title: 'Notices', icon: 'ClipboardList', href: '/notices' },
  { title: 'AI Help', icon: 'Bot', href: '/solve-doubts', iconClassName: 'text-orange-500' },
  { title: 'Notes', icon: 'Compass', href: '/browse' },
  
  { title: 'Leaderboard', icon: 'Swords', href: '/leaderboard' },
  { title: 'Daily Quiz', icon: 'Puzzle', href: '/puzzle-quiz' },
  { title: 'Mindmap', icon: 'BrainCircuit', href: '/mindmap' },

  { title: 'MCQs', icon: 'BookCheck', href: '/mcqs' },
  { title: 'Reasoning', icon: 'BrainCircuit', href: '/reasoning' },
  { title: 'Current Affairs', icon: 'Newspaper', href: '/current-affairs' },

  { title: 'Learn from YouTube', icon: 'Youtube', href: '/youtube-learning' },
  { title: 'Doubt Box', icon: 'MessageSquare', href: '/doubt-box' },
  { title: 'Complaints', icon: 'FileQuestion', href: '/complaints' },
  
  { title: 'About Us', icon: 'Users', href: '/about-us' },
  { title: 'User Manual', icon: 'BookUser', href: '/user-manual' },
  { title: 'Rules', icon: 'Gavel', href: '/terms' },
];

export function FeatureGrid() {
  return (
    <section className="w-full py-12">
      <div className="container px-4">
        <div className="grid grid-cols-3 gap-3 max-w-4xl mx-auto md:gap-4 lg:gap-6">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || iconMap['Puzzle'];
            const LinkComponent = feature.isExternal ? 'a' : Link;
            return (
              <LinkComponent
                key={feature.title}
                href={feature.href}
                {...(feature.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group block"
              >
                <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 overflow-hidden">
                  <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center aspect-square">
                    <div className={cn("bg-primary/10 text-primary p-3 rounded-lg mb-2 md:p-4", feature.iconClassName?.includes('orange') && 'bg-orange-500/10')}>
                      <Icon className={cn("h-6 w-6 md:h-8 md:w-8", feature.iconClassName)} />
                    </div>
                    <CardTitle className="text-xs md:text-sm font-semibold text-center truncate">
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
