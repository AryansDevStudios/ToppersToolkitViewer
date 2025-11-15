"use client";

import { useState, useEffect } from 'react';
import { BrainCircuit, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReasoningSet } from '@/lib/types';
import { getReasoningSets } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { ReasoningPlayer } from '@/components/reasoning/ReasoningPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumContentWrapper } from '@/components/common/PremiumContentWrapper';

export default function ReasoningPage() {
    const { dbUser } = useAuth();
    const [sets, setSets] = useState<ReasoningSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSet, setSelectedSet] = useState<ReasoningSet | null>(null);

    useEffect(() => {
        async function fetchSets() {
            setLoading(true);
            const data = await getReasoningSets();
            setSets(data);
            setLoading(false);
        }
        fetchSets();
    }, []);

    const attemptedQuizzes = dbUser?.attemptedReasoning || [];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <header className="text-center mb-12">
                     <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
                        <BrainCircuit className="h-12 w-12" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                        Reasoning Challenges
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Test your logical and analytical skills.
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
                <Button variant="outline" size="sm" onClick={() => setSelectedSet(null)} className="mb-8 flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Quizzes
                </Button>
                 <ReasoningPlayer
                    mcqs={selectedSet.mcqs}
                    setId={selectedSet.id}
                    setName={selectedSet.name}
                    onFinish={() => setSelectedSet(null)}
                />
            </div>
        )
    }

  return (
    <PremiumContentWrapper>
        <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
            <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
            <BrainCircuit className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
            Reasoning Challenges
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test your logical and analytical skills.
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
                        It looks like no Reasoning quizzes have been added yet. Please check back later.
                        </p>
                    </CardContent>
                </Card>
            )}
        </main>
        </div>
    </PremiumContentWrapper>
  );
}
