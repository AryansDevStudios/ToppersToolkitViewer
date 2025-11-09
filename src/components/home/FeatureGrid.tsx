
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { iconMap } from '@/lib/iconMap';
import { cn } from '@/lib/utils';
import type { Notice } from '@/lib/types';
import { useState, useEffect } from 'react';

const features = [
  { title: 'Notices', icon: 'ClipboardList', href: '/notices' },
  { title: 'AI Help', icon: 'Bot', href: '/solve-doubts', iconClassName: 'text-orange-500' },
  { title: 'Notes', icon: 'Compass', href: '/browse' },
  
  { title: 'Leaderboard', icon: 'Swords', href: '/leaderboard' },
  { title: 'FlashcardAI', icon: 'Sparkles', href: '/flashcard-ai', iconClassName: 'text-yellow-500' },
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

const LAST_SEEN_NOTICE_KEY = 'lastSeenNoticeTimestamp';

export function FeatureGrid({ notices }: { notices: Notice[] }) {
  const [newNoticeCount, setNewNoticeCount] = useState(0);

  useEffect(() => {
    if (notices && notices.length > 0) {
      const lastSeenTimestamp = localStorage.getItem(LAST_SEEN_NOTICE_KEY);
      if (!lastSeenTimestamp) {
        setNewNoticeCount(notices.length);
      } else {
        const lastSeen = parseInt(lastSeenTimestamp, 10);
        const newNotices = notices.filter(notice => notice.createdAt > lastSeen);
        setNewNoticeCount(newNotices.length);
      }
    }
  }, [notices]);

  return (
    <section className="w-full py-12">
      <div className="container px-4">
        <div className="grid grid-cols-3 gap-3 max-w-4xl mx-auto md:gap-4 lg:gap-6">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || iconMap['Puzzle'];
            const LinkComponent = feature.href.startsWith('http') ? 'a' : Link;
            const isNoticesCard = feature.title === 'Notices';

            return (
              <LinkComponent
                key={feature.title}
                href={feature.href}
                {...(feature.href.startsWith('http') ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group block relative transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
              >
                {isNoticesCard && newNoticeCount > 0 && (
                  <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 flex h-5 w-5 z-10 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {newNoticeCount}
                  </span>
                )}
                <Card className="h-full group-hover:shadow-lg overflow-hidden">
                  <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center aspect-square">
                    <div className={cn("bg-primary/10 text-primary p-3 rounded-lg mb-2 md:p-4", feature.iconClassName?.includes('orange') && 'bg-orange-500/10', feature.iconClassName?.includes('yellow') && 'bg-yellow-500/10')}>
                      <Icon className={cn("h-8 w-8 md:h-10 md:w-10", feature.iconClassName)} />
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
