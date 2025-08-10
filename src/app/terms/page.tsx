
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Terms and Conditions - Topper's Toolkit Viewer",
    description: 'Please read our terms and conditions carefully before using our service.',
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-bold font-headline mt-8 mb-4 border-b pb-2">{children}</h2>
);

const ListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="mb-2 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary">{children}</li>
);

export default function TermsAndConditionsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 font-headline">
                    Terms and Conditions
                </h1>
                <p className="text-muted-foreground">Last Updated: 10-08-2025</p>
            </header>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead">
                    Welcome to <strong>Topper’s Toolkit Viewer</strong> (
                    <Link href="https://topperstoolkitviewer.netlify.app" className="text-primary hover:underline" target="_blank">
                        https://topperstoolkitviewer.netlify.app
                    </Link>
                    ), owned and operated by <strong>Aryan Gupta (AryansDevStudios)</strong>.
                    By accessing purchased notes on this platform, you agree to the following Terms.
                </p>

                <SectionTitle>1. Access Rights</SectionTitle>
                <ul>
                    <ListItem>
                        Access is granted <strong>only to verified purchasers</strong> from{' '}
                        <Link href="https://topperstoolkit.netlify.app" className="text-primary hover:underline" target="_blank">
                            Topper’s Toolkit Shop
                        </Link>.
                    </ListItem>
                    <ListItem>Your account is for <strong>personal use only</strong>.</ListItem>
                    <ListItem>You do <strong>not</strong> own the content you view — all rights remain with <strong>Kuldeep Singh</strong>.</ListItem>
                </ul>

                <SectionTitle>2. Restrictions on Use</SectionTitle>
                <p>You are strictly prohibited from:</p>
                <ul>
                    <ListItem>Downloading, saving, or copying any notes.</ListItem>
                    <ListItem>Taking screenshots or screen recordings.</ListItem>
                    <ListItem>Printing any part of the notes.</ListItem>
                    <ListItem>Sharing your account login with others.</ListItem>
                    <ListItem>Selling, redistributing, or publishing the content.</ListItem>
                </ul>

                <SectionTitle>3. Anti-Piracy Notice</SectionTitle>
                <p>
                    We actively monitor for unauthorized sharing and may embed digital tracking within our notes to trace leaks.
                    Any violation will result in <strong>immediate account suspension</strong> and possible <strong>legal action</strong>.
                </p>

                <SectionTitle>4. Enforcement Actions</SectionTitle>
                <p>If you are found violating these Terms, the Owner/Seller may:</p>
                <ul>
                    <ListItem>Temporarily suspend or permanently terminate your account.</ListItem>
                    <ListItem>Remove access to specific notes or your entire library without refund.</ListItem>
                    <ListItem>Take legal measures to recover damages.</ListItem>
                </ul>
                <p>All enforcement decisions are final.</p>


                <SectionTitle>5. Service Availability</SectionTitle>
                <ul>
                    <ListItem>Access is usually provided continuously.</ListItem>
                    <ListItem>In rare situations, the site may be offline for up to <strong>1 hour</strong> for maintenance or technical issues.</ListItem>
                </ul>

                <SectionTitle>6. Access Timing</SectionTitle>
                <ul>
                    <ListItem>Note access is activated only after transaction verification on the Purchase Site.</ListItem>
                    <ListItem>This process may take <strong>1–2 hours</strong>, depending on seller availability.</ListItem>
                </ul>
                
                <SectionTitle>7. Agreement Requirement</SectionTitle>
                <p>
                    You must explicitly agree to these Terms when registering or logging into your account. Use of this platform implies full acceptance.
                </p>


                <SectionTitle>8. Contact</SectionTitle>
                <p>For any questions regarding these Terms:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <h3 className="font-semibold text-lg">Owner</h3>
                         <a href="mailto:aryan0106gupta@gmail.com" className="text-primary hover:underline block">aryan0106gupta@gmail.com</a>
                         <a href="https://wa.me/919838040111" className="text-primary hover:underline block">WhatsApp: +91 98380 40111</a>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg">Seller</h3>
                         <a href="mailto:kuldeepsingh012011@gmail.com" className="text-primary hover:underline block">kuldeepsingh012011@gmail.com</a>
                         <a href="https://wa.me/917754000411" className="text-primary hover:underline block">WhatsApp: +91 77540 00411</a>
                    </div>
                </div>

            </div>
        </div>
    );
}
