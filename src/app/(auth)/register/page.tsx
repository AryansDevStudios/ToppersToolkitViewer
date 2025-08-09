import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <h1 className="font-headline text-3xl font-bold text-center mb-2">Create an Account</h1>
      <p className="text-muted-foreground text-center mb-6">
        Join our community of learners today.
      </p>
      <RegisterForm />
       <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
