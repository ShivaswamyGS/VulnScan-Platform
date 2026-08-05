import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { FieldWrapper, TextInput } from "../../components/ui/FormField";
import { Alert } from "../../components/ui/Alert";
import { getErrorMessage } from "../../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
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
          <h1 className="font-mono text-lg font-semibold text-[var(--color-ink)]">VulnTriage</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">AI-assisted vulnerability triage</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
          {error && <Alert variant="error">{error}</Alert>}

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

          <FieldWrapper label="Password" htmlFor="password">
            <TextInput
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FieldWrapper>

          <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-ink-muted)]">
          New internal tester?{" "}
          <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
