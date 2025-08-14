
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookUser, ShoppingCart, LogIn, Search, ShieldQuestion } from 'lucide-react';

export const metadata: Metadata = {
    title: "User Manual - Topper's Toolkit Library",
    description: "A simple guide to using the Topper's Toolkit Library.",
};

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

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Step-by-Step Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <ManualStep icon={ShoppingCart} title="Step 1: Buy Notes from the Shop">
                        <p>This website is only for viewing notes you have already bought.</p>
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
                         <p>Fill in all your details to create your account.</p>
                    </ManualStep>

                    <ManualStep icon={Search} title="Step 3: Find and Read Your Notes">
                         <p>Once you are logged in, you can click on <strong>'Browse'</strong> to see all the notes.</p>
                         <p>You will only be able to open the notes that you have purchased. Other notes will show an "Access Denied" message.</p>
                    </ManualStep>

                     <ManualStep icon={ShieldQuestion} title="Having Trouble?">
                        <p>If you can't access notes you paid for, or have other problems, please contact us.</p>
                        <p>
                            Contact details are at the bottom of the page. Or you can read the full {' '}
                            <Link href="/terms" className="text-primary font-semibold hover:underline">
                                Terms and Conditions
                            </Link>.
                        </p>
                    </ManualStep>
                </CardContent>
            </Card>

             <div className="text-center mt-12">
                <Link href="/login" className="text-primary font-semibold hover:underline">
                    &larr; Back to Login
                </Link>
            </div>
        </div>
    );
}
