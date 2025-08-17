import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookUser, ShoppingCart, LogIn, Search, ShieldCheck, ShieldQuestion } from 'lucide-react';

export const metadata: Metadata = {
    title: "User Manual - Topper's Toolkit Library",
    description: "A simple guide to using the Topper's Toolkit Library.",
};

export const revalidate = 432000; // 5 days

const ManualStep = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
            <div className="bg-primary/10 text-primary rounded-lg p-3">
                <Icon className="h-6 w-6" />
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <div className="text-muted-foreground text-sm space-y-2">
                {children}
            </div>
        </div>
    </div>
);


export default function UserManualPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <header className="text-center mb-12">
                <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
                    <BookUser className="h-12 w-12" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                    How to Use This Website
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A simple guide for our students. Follow these steps to get started!</p>
            </header>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl">Step-by-Step Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <ManualStep icon={ShoppingCart} title="Step 1: Buy Notes from the Shop">
                        <p>This website is for viewing notes you have already bought.</p>
                        <p>First, you must buy the notes from our main shop website.</p>
                        <p>
                            <Link href="https://topperstoolkit.netlify.app" className="text-primary font-semibold hover:underline" target="_blank">
                                Click here to go to the Topper's Toolkit Shop &rarr;
                            </Link>
                        </p>
                    </ManualStep>

                    <ManualStep icon={LogIn} title="Step 2: Create Your Account Here">
                         <p>After you buy the notes, come back to this website.</p>
                         <p>Click on <strong>'Register'</strong>. Use the <strong>same email address</strong> you used for your purchase.</p>
                         <p>This is very important so we know which notes to give you access to!</p>
                    </ManualStep>

                    <ManualStep icon={Search} title="Step 3: Find and Read Your Notes">
                         <p>Once you are logged in, you can click on <strong>'Browse'</strong> to see all the subjects and notes.</p>
                         <p>You will only be able to open the notes that you have purchased.</p>
                    </ManualStep>
                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                   <div className="flex items-center gap-3">
                     <ShieldCheck className="h-6 w-6 text-destructive" />
                     <CardTitle className="text-2xl text-destructive">Very Important Rules</CardTitle>
                   </div>
                   <CardDescription>
                        To protect our hard work, you must follow these rules.
                   </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <p>
                        The notes you buy are for your personal use only. You do not own them.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>
                            <strong>Do NOT share your account password.</strong> Your account is for you alone.
                        </li>
                        <li>
                            <strong>Do NOT take screenshots, record your screen, or download the notes.</strong> The website is for viewing only.
                        </li>
                        <li>
                            <strong>Do NOT try to sell or share the notes with others.</strong>
                        </li>
                    </ul>
                    <p className="font-semibold text-card-foreground">
                        If these rules are broken, your account will be immediately suspended without a refund, and we may take further action. Please be respectful of our work.
                    </p>
                </CardContent>
            </Card>

             <div className="text-center mt-12 space-y-4">
                 <p className="text-muted-foreground">
                    Still have questions? Contact us or read the full {' '}
                    <Link href="/terms" className="text-primary font-semibold hover:underline">
                        Terms and Conditions
                    </Link>.
                 </p>
            </div>
        </div>
    );
}
