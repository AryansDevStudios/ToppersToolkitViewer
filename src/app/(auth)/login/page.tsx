import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <h1 className="font-headline text-3xl font-bold text-center mb-2">Welcome Back</h1>
      <p className="text-muted-foreground text-center mb-6">
        Enter your credentials to access your account.
      </p>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
