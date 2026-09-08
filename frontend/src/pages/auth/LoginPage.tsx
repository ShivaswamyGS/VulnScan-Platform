import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useCompanyAuth } from "../../context/CompanyAuthContext";

import { Alert } from "../../components/ui/Alert";
import { getErrorMessage } from "../../api/client";

import { useState, type FormEvent } from "react";

export function LoginPage() {
  const { login } = useAuth();

  const {
    login: companyLogin,
  } = useCompanyAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      /*
       * =====================================================
       * FIRST: NORMAL USER LOGIN
       * =====================================================
       *
       * Existing researchers/admins continue to use
       * the normal authentication system.
       */

      try {
        await login(email, password);

        navigate("/reports");
        return;
      } catch (userLoginError) {
        console.log(
          "Normal user login failed. Trying company login..."
        );
      }

      /*
       * =====================================================
       * SECOND: COMPANY LOGIN
       * =====================================================
       *
       * IMPORTANT:
       *
       * Do NOT manually put the company token into
       * localStorage here.
       *
       * companyLogin() updates CompanyAuthContext,
       * which makes CompanyProtectedRoute recognize
       * the company as authenticated.
       */

      await companyLogin(email, password);

      /*
       * =====================================================
       * COMPANY DASHBOARD
       * =====================================================
       *
       * Company authentication was successful.
       * Send the company to its dashboard.
       */

      navigate("/company/dashboard");
      return;

    } catch (err) {
      console.error(
        "LOGIN FAILED:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT — BRAND / PRODUCT
        ===================================================== */}

        <div className="relative hidden overflow-hidden bg-slate-950 p-10 xl:p-14 lg:flex lg:flex-col lg:justify-between">

          {/* Background decoration */}

          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />

          <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/20">

                <ShieldCheck className="h-6 w-6 text-white" />

              </div>

              <div>

                <p className="text-lg font-bold tracking-tight text-white">
                  VulnTriage
                </p>

                <p className="text-xs text-slate-400">
                  Security Intelligence Platform
                </p>

              </div>

            </div>

          </div>


          <div className="relative z-10 max-w-xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              Secure vulnerability management

            </div>


            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">

              Find vulnerabilities.

              <br />

              <span className="text-[var(--color-accent)]">
                Fix them faster.
              </span>

            </h1>


            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">

              A centralized platform for security researchers and
              organizations to discover, report, review, and manage
              vulnerabilities securely.

            </p>


            <div className="mt-8 space-y-4">

              {[
                "Secure vulnerability submissions",
                "Bug bounty program management",
                "Centralized security reporting",
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >

                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />

                  {item}

                </div>

              ))}

            </div>

          </div>


          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">

            <span>
              © {new Date().getFullYear()} VulnTriage
            </span>

            <span>
              Security • Research • Response
            </span>

          </div>

        </div>


        {/* =====================================================
            RIGHT — LOGIN
        ===================================================== */}

        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">


            {/* Mobile logo */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]">

                <ShieldCheck className="h-5 w-5 text-white" />

              </div>


              <div>

                <p className="font-bold text-slate-900">
                  VulnTriage
                </p>

                <p className="text-xs text-slate-500">
                  Security Intelligence Platform
                </p>

              </div>

            </div>


            {/* Header */}

            <div className="mb-8">

              <p className="mb-2 text-sm font-semibold text-[var(--color-accent)]">
                SECURE ACCESS
              </p>


              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>


              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to access your vulnerability management
                workspace.
              </p>

            </div>


            {/* Login Card */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

              {error && (

                <div className="mb-5">

                  <Alert variant="error">
                    {error}
                  </Alert>

                </div>

              )}


              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Email address
                  </label>


                  <div className="relative">

                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />


                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@company.com"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                </div>


                {/* Password */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Password
                    </label>


                    <span className="text-xs text-slate-400">
                      Secure login
                    </span>

                  </div>


                  <div className="relative">

                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />


                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                </div>


                {/* Submit */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/20 transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >

                  {isSubmitting ? (

                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...

                    </>

                  ) : (

                    <>
                      Sign in

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                    </>

                  )}

                </button>

              </form>


              {/* Divider */}

              <div className="my-6 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  New to VulnTriage?
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>


              {/* Register */}

              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Create an account
              </Link>


              {/* Company registration */}

              <Link
                to="/company/register"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
              >
                Register as a company
              </Link>

            </div>


            {/* Footer */}

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">

              Your credentials are securely transmitted and
              protected by the platform's authentication system.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LoginPage;