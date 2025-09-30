
"use client";

import { useState, useEffect } from 'react';
import { Newspaper, RefreshCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CurrentAffairsSet } from '@/lib/types';
import { getCurrentAffairsSets } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { MCQPlayer } from '@/components/mcqs/MCQPlayer';
import { Skeleton } from '@/components/ui/skeleton';

export default function CurrentAffairsPage() {
    const { dbUser } = useAuth();
    const [sets, setSets] = useState<CurrentAffairsSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSet, setSelectedSet] = useState<CurrentAffairsSet | null>(null);

    useEffect(() => {
        async function fetchSets() {
            setLoading(true);
            const data = await getCurrentAffairsSets();
            setSets(data);
            setLoading(false);
        }
        fetchSets();
    }, []);

    const attemptedQuizzes = dbUser?.attemptedCurrentAffairs || [];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <header className="text-center mb-12">
                     <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
                        <Newspaper className="h-12 w-12" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                        Current Affairs Quizzes
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Test your knowledge of recent events.
                    </p>
                </header>
                <main className="max-w-2xl mx-auto space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </main>
            </div>
        )
    }

    if (selectedSet) {
        return (
             <div className="container mx-auto px-4 py-12">
                 <MCQPlayer
                    mcqs={selectedSet.mcqs}
                    chapterId={selectedSet.id} // Re-using chapterId prop for the set ID
                    chapterName={selectedSet.name}
                    onFinish={() => setSelectedSet(null)}
                />
            </div>
        )
    }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Newspaper className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Current Affairs Quizzes
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Test your knowledge of recent events.
        </p>
      </header>
      <main className="max-w-2xl mx-auto">
        {sets.length > 0 ? (
            <div className="space-y-4">
                {sets.map(set => {
                    const hasAttempted = attemptedQuizzes.includes(set.id);
                    return (
                        <Card key={set.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <h3 className="font-semibold text-lg">{set.name} <span className="text-muted-foreground text-sm font-normal">({set.mcqs.length} Qs)</span></h3>
                                <Button
                                    variant={hasAttempted ? 'outline' : 'default'}
                                    onClick={() => setSelectedSet(set)}
                                >
                                    {hasAttempted && <RefreshCcw className="mr-2 h-4 w-4" />}
                                    {hasAttempted ? 'Re-attempt' : 'Start Quiz'}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        ) : (
             <Card>
                <CardHeader>
                    <CardTitle>No Quizzes Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                    It looks like no Current Affairs quizzes have been added yet. Please check back later.
                    </p>
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
