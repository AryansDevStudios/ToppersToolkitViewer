
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-md font-semibold font-headline mt-4 mb-2">{children}</h3>
);

const ListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="mb-2 pl-4 text-sm relative before:content-['•'] before:absolute before:left-0 before:text-primary">{children}</li>
);

export default function RegisterPage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column: Form */}
            <div className="flex flex-col justify-center">
                 <div className="mb-8 text-center lg:text-left">
                    <h1 className="font-headline text-3xl font-bold">Create an Account</h1>
                    <p className="text-muted-foreground mt-2">
                        Join our community of learners today.
                    </p>
                 </div>
                <RegisterForm />
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                    Login
                    </Link>
                </p>
            </div>

            {/* Right Column: T&C */}
            <div className="hidden lg:flex flex-col">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Terms and Conditions</CardTitle>
                        <CardDescription>Please read our terms carefully before registering.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-8rem)]">
                        <ScrollArea className="h-full w-full p-4 rounded-md border bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-4">
                                Welcome to <strong>Topper’s Toolkit Viewer</strong>, owned and operated by <strong>Aryan Gupta (AryansDevStudios)</strong>.
                                By accessing purchased notes on this platform, you agree to the following Terms.
                            </p>
                            <SectionTitle>1. Access Rights</SectionTitle>
                            <ul className="text-muted-foreground">
                                <ListItem>Access is granted <strong>only to verified purchasers</strong> from Topper’s Toolkit Shop.</ListItem>
                                <ListItem>Your account is for <strong>personal use only</strong>.</ListItem>
                                <ListItem>You do <strong>not</strong> own the content you view — all rights remain with <strong>Kuldeep Singh</strong>.</ListItem>
                            </ul>

                            <SectionTitle>2. Restrictions on Use</SectionTitle>
                            <p className="text-sm text-muted-foreground">You are strictly prohibited from:</p>
                            <ul className="text-muted-foreground">
                                <ListItem>Downloading, saving, or copying any notes.</ListItem>
                                <ListItem>Taking screenshots or screen recordings.</ListItem>
                                <ListItem>Printing any part of the notes.</ListItem>
                                <ListItem>Sharing your account login with others.</ListItem>
                                <ListItem>Selling, redistributing, or publishing the content.</ListItem>
                            </ul>

                            <SectionTitle>3. Anti-Piracy Notice</SectionTitle>
                            <p className="text-sm text-muted-foreground">
                                We actively monitor for unauthorized sharing and may embed digital tracking within our notes to trace leaks.
                                Any violation will result in <strong>immediate account suspension</strong> and possible <strong>legal action</strong>.
                            </p>
                            <SectionTitle>4. Enforcement Actions</SectionTitle>
                            <p className="text-sm text-muted-foreground">If you are found violating these Terms, the Owner/Seller may:</p>
                            <ul className="text-muted-foreground">
                                <ListItem>Temporarily suspend or permanently terminate your account.</ListItem>
                                <ListItem>Remove access to specific notes or your entire library without refund.</ListItem>
                                <ListItem>Take legal measures to recover damages.</ListItem>
                            </ul>

                            <SectionTitle>5. Agreement Requirement</SectionTitle>
                            <p className="text-sm text-muted-foreground">
                                You must explicitly agree to these Terms to create an account. Use of this platform implies full acceptance.
                            </p>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
