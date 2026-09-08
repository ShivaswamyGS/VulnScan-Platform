import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { Eye, ArrowLeft, Pencil } from "lucide-react";

import CompanyLayout from "../../components/company/CompanyLayout";

import {
  getCompanyProgramById,
  type BugBountyProgram,
} from "../../api/company";

import { getErrorMessage } from "../../api/client";

export default function CompanyProgramDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [program, setProgram] =
    useState<BugBountyProgram | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadProgram() {
      if (!id) {
        setError("Program ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await getCompanyProgramById(Number(id));

        setProgram(data);
      } catch (err) {
        console.error(
          "Failed to load company program:",
          err
        );

        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadProgram();
  }, [id]);

  function getStatusClass(status?: string) {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";

      case "paused":
        return "bg-yellow-100 text-yellow-700";

      case "closed":
        return "bg-red-100 text-red-700";

      case "draft":
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <CompanyLayout title="Program Details">
        <div className="p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              Loading program...
            </p>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  if (error || !program) {
    return (
      <CompanyLayout title="Program Details">
        <div className="p-6">
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || "Program not found."}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/company/programs")
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Programs
          </button>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout title="Program Details">
      <div className="p-6 md:p-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/company/programs")
              }
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={16} />
              Back to Programs
            </button>

            <h1 className="text-2xl font-bold text-slate-900">
              {program.program_name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {program.target_website}
            </p>
          </div>

          <Link
            to={`/company/programs/${program.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Pencil size={16} />
            Edit Program
          </Link>
        </div>

        {/* STATUS */}
        <div className="mb-6 flex flex-wrap gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
              program.status
            )}`}
          >
            {program.status}
          </span>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            {program.visibility}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              program.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {program.is_active
              ? "Program enabled"
              : "Program disabled"}
          </span>
        </div>

        {/* MAIN */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* DESCRIPTION */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                Description
              </h2>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {program.description ||
                  "No description provided."}
              </p>
            </section>

            {/* SCOPE */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                In-Scope Assets
              </h2>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {program.scope ||
                  "No scope information provided."}
              </p>
            </section>

            {/* OUT OF SCOPE */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                Out-of-Scope Assets
              </h2>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {program.out_of_scope ||
                  "No out-of-scope assets specified."}
              </p>
            </section>

            {/* RULES */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                Program Rules
              </h2>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {program.program_rules ||
                  "No program rules specified."}
              </p>
            </section>

            {/* SUBMISSION GUIDELINES */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                Submission Guidelines
              </h2>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {program.submission_guidelines ||
                  "No submission guidelines specified."}
              </p>
            </section>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* REWARD */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Reward
              </h2>

              <p className="mt-3 text-xl font-bold text-slate-900">
                ₹{program.reward_min ?? 0}
                {" - "}
                ₹{program.reward_max ?? 0}
              </p>

              {program.severity_reward_matrix && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-medium text-slate-500">
                    Severity Reward Matrix
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {program.severity_reward_matrix}
                  </p>
                </div>
              )}
            </section>

            {/* PROGRAM INFO */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                Program Information
              </h2>

              <div className="space-y-4">

                <div>
                  <p className="text-xs text-slate-400">
                    Target Website
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-800">
                    {program.target_website}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                    {program.status}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Visibility
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                    {program.visibility}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Start Date
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {program.start_date
                      ? new Date(
                          program.start_date
                        ).toLocaleString()
                      : "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    End Date
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {program.end_date
                      ? new Date(
                          program.end_date
                        ).toLocaleString()
                      : "No end date"}
                  </p>
                </div>

              </div>
            </section>

            {/* EDIT */}
            <Link
              to={`/company/programs/${program.id}/edit`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Pencil size={16} />
              Edit This Program
            </Link>

          </div>
        </div>
      </div>
    </CompanyLayout>
  );
}