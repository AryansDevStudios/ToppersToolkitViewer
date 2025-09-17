
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function DoubtBoxPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <MessageSquare className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Doubt Box
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Have a question? Drop it in the doubt box.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our doubt box feature is being built. Soon you'll be able to submit your questions here.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
