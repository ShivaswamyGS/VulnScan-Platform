import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { registerUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { FieldWrapper, TextInput } from "../../components/ui/FormField";
import { Alert } from "../../components/ui/Alert";
import { getErrorMessage } from "../../api/client";

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({ full_name: fullName, email, password });
      // Registration succeeded — log the new account in immediately rather
      // than bouncing them back to a second login form.
      await login(email, password);
      navigate("/reports");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-sidebar)]">
            <ShieldAlert size={20} className="text-[var(--color-accent)]" />
          </div>
          <h1 className="font-mono text-lg font-semibold text-[var(--color-ink)]">Create your account</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">For internal security testers</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
          {error && <Alert variant="error">{error}</Alert>}

          <FieldWrapper label="Full name" htmlFor="fullName">
            <TextInput
              id="fullName"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Asha Rao"
            />
          </FieldWrapper>

          <FieldWrapper label="Email" htmlFor="email">
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </FieldWrapper>

          <FieldWrapper label="Password" htmlFor="password" hint="At least 8 characters.">
            <TextInput
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FieldWrapper>

          <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-ink-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
