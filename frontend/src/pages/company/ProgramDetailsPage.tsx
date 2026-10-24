import type { Program } from "../../api/programs";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Globe,
  ShieldCheck,
  Target,
  Wallet,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  getProgramById,
} from "../../api/programs";

import { getErrorMessage } from "../../api/client";

function formatReward(value?: number | null) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Not specified";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not specified"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function statusClass(status?: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "paused":
      return "bg-amber-50 text-amber-700";
    case "closed":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function ProgramDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [program, setProgram] =
    useState<Program | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Program ID is missing");
      setLoading(false);
      return;
    }

    getProgramById(Number(id))
      .then(setProgram)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout title="Bug Bounty Program">
        <Card className="p-8 animate-pulse">
          <div className="h-8 w-1/3 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-1/2 rounded bg-slate-200" />
          <div className="mt-8 h-32 rounded bg-slate-100" />
        </Card>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Bug Bounty Program">
        <Alert variant="error">{error}</Alert>

        <Link
          to="/programs"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Programs
        </Link>
      </AppLayout>
    );
  }

  if (!program) {
    return (
      <AppLayout title="Bug Bounty Program">
        <Card className="p-10 text-center">
          <Target className="mx-auto h-10 w-10 text-slate-400" />

          <h2 className="mt-4 text-lg font-bold">
            Program not found
          </h2>

          <Link
            to="/programs"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Link>
        </Card>
      </AppLayout>
    );
  }

  const canSubmit =
    program.status?.toLowerCase() === "active" &&
    program.is_active;

  return (
    <AppLayout title="Bug Bounty Program">
      <div className="space-y-6">

        {/* BACK */}
        <Link
          to="/programs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Programs
        </Link>

        {/* HEADER */}
        <Card className="overflow-hidden">
          <div className="bg-slate-900 p-6 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <ShieldCheck className="h-4 w-4" />
                  Bug Bounty Program
                </div>

                <h1 className="text-2xl font-bold">
                  {program.program_name}
                </h1>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {program.target_website}
                  </span>

                  <span>
                    Company ID: {program.company_id}
                  </span>
                </div>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                  program.status
                )}`}
              >
                {program.status}
              </span>
            </div>

            {program.description && (
              <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-300">
                {program.description}
              </p>
            )}
          </div>

          {/* REWARD SUMMARY */}
          <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-5">
              <p className="text-xs uppercase text-slate-400">
                Minimum Reward
              </p>
              <p className="mt-1 text-xl font-bold">
                {formatReward(program.reward_min)}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs uppercase text-slate-400">
                Maximum Reward
              </p>
              <p className="mt-1 text-xl font-bold text-blue-600">
                {formatReward(program.reward_max)}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs uppercase text-slate-400">
                Visibility
              </p>
              <p className="mt-1 text-xl font-bold capitalize">
                {program.visibility || "Not specified"}
              </p>
            </div>
          </div>
        </Card>

        {/* CONTENT */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">

            <Card className="p-6">
              <Section
                icon={<FileText className="h-5 w-5 text-blue-600" />}
                title="Description"
              />

              <Text>
                {program.description || "No description provided."}
              </Text>
            </Card>

            <Card className="p-6">
              <Section
                icon={<Target className="h-5 w-5 text-emerald-600" />}
                title="In Scope"
              />

              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <Text>
                  {program.scope || "No scope information provided."}
                </Text>
              </div>
            </Card>

            <Card className="p-6">
              <Section
                icon={
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                }
                title="Out of Scope"
              />

              <div className="mt-4 rounded-xl bg-red-50 p-4">
                <Text>
                  {program.out_of_scope ||
                    "No out-of-scope information provided."}
                </Text>
              </div>
            </Card>

            <Card className="p-6">
              <Section
                icon={
                  <ShieldCheck className="h-5 w-5 text-slate-700" />
                }
                title="Program Rules"
              />

              <Text>
                {program.program_rules ||
                  "No program rules provided."}
              </Text>
            </Card>

            <Card className="p-6">
              <Section
                icon={
                  <FileText className="h-5 w-5 text-violet-600" />
                }
                title="Submission Guidelines"
              />

              <Text>
                {program.submission_guidelines ||
                  "No submission guidelines provided."}
              </Text>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            <Card className="p-5">
              <Section
                icon={<Wallet className="h-5 w-5 text-amber-600" />}
                title="Reward"
              />

              <div className="mt-4">
                <p className="text-2xl font-bold">
                  {formatReward(program.reward_min)}
                </p>

                <p className="my-1 text-xs text-slate-400">
                  Minimum
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {formatReward(program.reward_max)}
                </p>

                <p className="text-xs text-slate-400">
                  Maximum
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <Section
                icon={
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                }
                title="Program Period"
              />

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Start Date
                  </p>
                  <p className="font-semibold">
                    {formatDate(program.start_date)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    End Date
                  </p>
                  <p className="font-semibold">
                    {formatDate(program.end_date)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Current Status
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                    program.status
                  )}`}
                >
                  {program.status}
                </span>

                <span className="text-xs text-slate-500">
                  {program.is_active
                    ? "Program is active"
                    : "Program is inactive"}
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* ACTIONS */}
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">
                Program Actions
              </h2>

              <p className="text-xs text-slate-500">
                Submit a vulnerability to this program.
              </p>
            </div>

            <div className="flex gap-3">
              {canSubmit && (
                <Link
                  to={`/programs/${program.id}/submit`}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Submit Vulnerability
                </Link>
              )}

              <Link
                to="/programs"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                Back
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------
   SMALL REUSABLE COMPONENTS
------------------------------------------------------- */

function Section({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-slate-50 p-2.5">
        {icon}
      </div>

      <h2 className="font-bold text-[var(--color-ink)]">
        {title}
      </h2>
    </div>
  );
}

function Text({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
      {children}
    </p>
  );
}
