
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Puzzle } from 'lucide-react';

export default function PuzzleAndQuizPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Puzzle className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Puzzles & Quizzes
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Challenge your mind with our puzzles and test your knowledge with quizzes.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section is being developed. Get ready to solve some brain-teasers and test your skills!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
