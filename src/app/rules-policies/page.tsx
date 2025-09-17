import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel } from 'lucide-react';

export default function RulesAndPoliciesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Gavel className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Rules & Policies
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Important guidelines for our community.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our comprehensive list of rules and policies is being finalized and will be published here shortly.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
