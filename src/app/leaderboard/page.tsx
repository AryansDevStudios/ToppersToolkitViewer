
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords } from 'lucide-react';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Swords className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          See who's at the top of the ranks.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The leaderboard is currently under construction. Check back soon to see where you stand!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
