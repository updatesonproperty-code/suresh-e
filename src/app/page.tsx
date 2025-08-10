import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/icons/logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-2">
            <Logo className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Suresh Electricals
          </h1>
          <p className="text-muted-foreground">
            Enter your credentials to log in.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-lg">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
