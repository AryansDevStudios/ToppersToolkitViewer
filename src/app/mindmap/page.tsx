
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

export default function MindmapPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <BrainCircuit className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Mind Maps
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Visualize complex topics with our mind maps.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Interactive mind maps are being created and will be available here shortly.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
