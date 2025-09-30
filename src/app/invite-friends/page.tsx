
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Share2, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const ADMIN_WHATSAPP_NUMBER = "917754000411"; // Admin's WhatsApp number

const Step = ({ step, title, description }: { step: number; title: string; description: string; }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 flex-col flex items-center justify-center bg-primary text-primary-foreground h-10 w-10 rounded-full font-bold text-lg">
            {step}
        </div>
        <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </div>
);

export default function InviteFriendsPage() {
    const { user, dbUser, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isShareSupported, setIsShareSupported] = useState(false);

    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            setIsShareSupported(true);
        }
    }, []);

    const registrationLink = typeof window !== 'undefined' ? `${window.location.origin}/register` : '';

    const handleShare = async () => {
        if (!user) {
            toast({ title: 'Please Log In', description: 'You need to be logged in to share invites.', variant: 'destructive' });
            router.push('/login');
            return;
        }

        const shareData = {
            title: "Join me on Topper's Toolkit!",
            text: `Hey! I'm using Topper's Toolkit for my studies. It's been really helpful. You should check it out and sign up!`,
            url: registrationLink,
        };

        try {
            if (isShareSupported) {
                await navigator.share(shareData);
            } else {
                // Fallback for desktop or unsupported browsers
                await navigator.clipboard.writeText(shareData.url);
                toast({
                    title: 'Link Copied!',
                    description: 'The registration link has been copied to your clipboard. Paste it to share with your friends!',
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Even if sharing fails, we can fall back to clipboard
             try {
                await navigator.clipboard.writeText(shareData.url);
                 toast({
                    title: 'Link Copied!',
                    description: 'Sharing was cancelled, but the link has been copied to your clipboard.',
                });
            } catch (copyError) {
                 toast({
                    title: 'Failed to Share or Copy',
                    description: 'Could not open the share dialog or copy the link.',
                    variant: 'destructive',
                });
            }
        }
    };
    
    const handleSendProof = () => {
        if (!user || !dbUser) {
            toast({ title: 'Please Log In', description: 'You need to be logged in to send proof.', variant: 'destructive' });
            router.push('/login');
            return;
        }

        const message = `Hello! I've successfully invited a friend to Topper's Toolkit.

*My Details:*
Name: ${dbUser.name}
User ID: ${user.uid}

I would like to claim my reward. Here is the screenshot of the proof:`;
        const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Gift className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
          Invite Friends & Get Rewards
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Share the knowledge with your friends and get rewarded for it!
        </p>
      </header>
      <main className="max-w-2xl mx-auto space-y-8">
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="text-xl text-primary">Your Reward</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg">For every new friend who successfully registers using your invite, you will receive <strong className="text-foreground">1 day of full access</strong> to all premium content!</p>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Follow these simple steps to claim your reward.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Step 
                step={1} 
                title="Share the Invite Link"
                description="Click the 'Share Invite Link' button below to send the registration link to your friends via WhatsApp, Telegram, or any other app."
            />
             <Step 
                step={2} 
                title="Take a Screenshot"
                description="After sending the message to your friend, take a screenshot of the chat as proof that you have invited them."
            />
             <Step 
                step={3} 
                title="Send Proof to Admin"
                description="Once your friend has successfully registered, click the 'Send Proof to Admin' button. This will open WhatsApp for you to send your screenshot to the owner."
            />
            <Step 
                step={4} 
                title="Get Your Reward"
                description="After the admin verifies your proof and your friend's registration, your account will be granted one full day of access. Enjoy!"
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
             <Button className="w-full sm:w-auto" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Invite Link
             </Button>
              <Button className="w-full sm:w-auto" variant="outline" onClick={handleSendProof}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Proof to Admin
              </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
