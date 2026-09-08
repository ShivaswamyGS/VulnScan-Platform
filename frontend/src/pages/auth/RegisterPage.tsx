import {
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">

        <div className="w-full max-w-4xl">

          {/* BRAND */}
          <div className="mb-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <ShieldCheck size={24} />
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              Create your VulnTriage account
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
              Choose the account type that matches how you will use the
              vulnerability management platform.
            </p>
          </div>

          {/* ACCOUNT TYPES */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* INTERNAL TESTER */}
            <Link
              to="/register/tester"
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={25} />
                </div>

                <ArrowRight
                  size={20}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                />

              </div>

              <h2 className="mt-6 text-xl font-bold text-slate-900">
                Internal Security Tester
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Register as a security researcher or internal vulnerability
                tester to discover, submit and track security reports.
              </p>

              <div className="mt-6 space-y-2.5">

                <Feature text="Submit vulnerability reports" />
                <Feature text="Participate in bug bounty programs" />
                <Feature text="Track your submissions" />

              </div>

              <div className="mt-7 rounded-lg bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-700">
                Register as Tester
              </div>
            </Link>

            {/* COMPANY */}
            <Link
              to="/company/register"
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Building2 size={25} />
                </div>

                <ArrowRight
                  size={20}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
                />

              </div>

              <h2 className="mt-6 text-xl font-bold text-slate-900">
                Company
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Register your organization to manage projects, assets,
                vulnerability reports and security operations.
              </p>

              <div className="mt-6 space-y-2.5">

                <Feature text="Manage company projects" />
                <Feature text="Manage employees and assets" />
                <Feature text="Monitor vulnerability reports" />

              </div>

              <div className="mt-7 rounded-lg bg-violet-50 px-4 py-3 text-center text-sm font-semibold text-violet-700">
                Register Company
              </div>
            </Link>

          </div>

          {/* ADMIN NOTICE */}
          <div className="mt-7 rounded-xl border border-slate-200 bg-white px-5 py-4 text-center shadow-sm">

            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                Administrator?
              </span>{" "}
              Admin accounts are provisioned by the VulnTriage platform and
              do not use public registration.
            </p>

          </div>

          {/* LOGIN */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <CheckCircle2
        size={16}
        className="shrink-0 text-emerald-500"
      />
      <span>{text}</span>
    </div>
  );
}