import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function PurchaseHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <History className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Purchase and History
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          View your transaction records and access history.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We are working on this section to provide you with a detailed view of your purchase and access history.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}