import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

export default function InviteFriendsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Gift className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Invite Friends
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Share the knowledge and earn rewards.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our referral program is under construction. Soon you'll be able to invite friends and get exciting rewards!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
