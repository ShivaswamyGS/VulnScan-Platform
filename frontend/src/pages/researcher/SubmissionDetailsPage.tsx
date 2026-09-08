import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getMySubmissionById,
  type VulnerabilitySubmission,
} from "../../api/submissions";

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "accepted":
    case "resolved":
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rejected":
    case "closed":
      return "border-red-200 bg-red-50 text-red-700";

    case "triaged":
    case "in_review":
    case "under_review":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "duplicate":
      return "border-purple-200 bg-purple-50 text-purple-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getSeverityClasses(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "border-red-200 bg-red-50 text-red-700";

    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "low":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "informational":
    case "info":
      return "border-gray-200 bg-gray-50 text-gray-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-[var(--color-accent)]" />

          <h2 className="text-base font-semibold text-gray-900">
            {title}
          </h2>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function EmptyValue({
  text = "Not provided.",
}: {
  text?: string;
}) {
  return (
    <span className="text-sm italic text-gray-400">
      {text}
    </span>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>

      <div className="text-sm font-medium text-gray-800">
        {value}
      </div>
    </div>
  );
}

export default function SubmissionDetailsPage() {
  const { submissionId } =
    useParams<{ submissionId: string }>();

  const [submission, setSubmission] =
    useState<VulnerabilitySubmission | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmission() {
      if (!submissionId) {
        setError("Submission ID is missing.");
        setLoading(false);
        return;
      }

      const numericId = Number(submissionId);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        setError("Invalid submission ID.");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const data =
          await getMySubmissionById(numericId);

        setSubmission(data);
      } catch (err) {
        console.error(
          "Failed to load submission:",
          err
        );

        setError("Unable to load this submission.");
      } finally {
        setLoading(false);
      }
    }

    loadSubmission();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50/60 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-accent)]" />

          <h2 className="text-base font-semibold text-gray-900">
            Loading submission
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Please wait while we retrieve your vulnerability report.
          </p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-[70vh] bg-gray-50/60 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-5">
          <Link
            to="/researcher/submissions"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Back to My Submissions
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-800">
                  Unable to load submission
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error || "Submission not found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status =
    submission.status?.trim() || "Pending";

  const severity =
    submission.severity?.trim() || "Not rated";

  const bounty =
    Number(submission.bounty_amount || 0);

  const formattedStatus = formatStatus(status);

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            to="/researcher/submissions"
            className="font-medium text-gray-500 transition hover:text-gray-900"
          >
            My Submissions
          </Link>

          <span className="text-gray-300">/</span>

          <span className="font-medium text-gray-900">
            Submission #{submission.id}
          </span>
        </div>

        {/* Hero Header */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-7 sm:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">

              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white">
                    Report #{submission.id}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                      status
                    )}`}
                  >
                    {formattedStatus}
                  </span>
                </div>

                <h1 className="max-w-4xl text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {submission.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                  <span>
                    Program ID{" "}
                    <strong className="text-gray-800">
                      #{submission.program_id}
                    </strong>
                  </span>

                  <span className="hidden text-gray-300 sm:inline">
                    •
                  </span>

                  <span>
                    Submitted{" "}
                    <strong className="text-gray-800">
                      {submission.submitted_at
                        ? new Date(
                            submission.submitted_at
                          ).toLocaleDateString()
                        : "-"}
                    </strong>
                  </span>
                </div>
              </div>

              <Link
                to={`/researcher/programs/${submission.program_id}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                View Program
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 border-t border-gray-100 sm:grid-cols-3">

            <div className="border-b border-gray-100 p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Severity
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${getSeverityClasses(
                    severity
                  )}`}
                >
                  {formatStatus(severity)}
                </span>
              </div>
            </div>

            <div className="border-b border-gray-100 p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Bounty
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                ₹{bounty.toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Assigned reward
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Submitted
              </p>

              <p className="mt-2 text-sm font-semibold text-gray-900">
                {submission.submitted_at
                  ? new Date(
                      submission.submitted_at
                    ).toLocaleString()
                  : "-"}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Report submission time
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main Column */}
          <div className="space-y-6 lg:col-span-2">

            <SectionCard title="Vulnerability Description">
              <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {submission.description ? (
                  submission.description
                ) : (
                  <EmptyValue />
                )}
              </div>
            </SectionCard>

            {submission.vulnerability_type && (
              <SectionCard title="Vulnerability Type">
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <p className="text-sm font-semibold text-gray-800">
                    {submission.vulnerability_type}
                  </p>
                </div>
              </SectionCard>
            )}

            {submission.affected_asset && (
              <SectionCard title="Affected Asset">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Target
                  </p>

                  <p className="break-all whitespace-pre-wrap rounded-lg bg-white px-3 py-3 font-mono text-sm leading-6 text-gray-700">
                    {submission.affected_asset}
                  </p>
                </div>
              </SectionCard>
            )}

            {submission.steps_to_reproduce && (
              <SectionCard title="Steps to Reproduce">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                    {submission.steps_to_reproduce}
                  </div>
                </div>
              </SectionCard>
            )}

            {submission.proof_of_concept && (
              <SectionCard title="Proof of Concept">
                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950 p-5 shadow-inner">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                  </div>

                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-gray-100">
                    {submission.proof_of_concept}
                  </pre>
                </div>
              </SectionCard>
            )}

            {submission.impact && (
              <SectionCard title="Impact">
                <div className="rounded-xl bg-amber-50/60 p-5">
                  <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                    {submission.impact}
                  </div>
                </div>
              </SectionCard>
            )}

            {submission.remediation && (
              <SectionCard title="Recommended Remediation">
                <div className="rounded-xl bg-emerald-50/60 p-5">
                  <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                    {submission.remediation}
                  </div>
                </div>
              </SectionCard>
            )}

            {submission.reviewer_comment && (
              <SectionCard
                title="Reviewer Feedback"
                className="border-blue-200"
              >
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      R
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Program Reviewer
                      </p>

                      <p className="text-xs text-gray-500">
                        Review feedback
                      </p>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                    {submission.reviewer_comment}
                  </p>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

            {/* Review Status */}
            <SectionCard title="Review Status">
              <div className="space-y-4">

                <InfoRow
                  label="Current Status"
                  value={
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        status
                      )}`}
                    >
                      {formattedStatus}
                    </span>
                  }
                />

                <InfoRow
                  label="Severity"
                  value={
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityClasses(
                        severity
                      )}`}
                    >
                      {formatStatus(severity)}
                    </span>
                  }
                />

                <InfoRow
                  label="Bounty"
                  value={
                    <span className="text-base font-bold text-gray-900">
                      ₹{bounty.toFixed(2)}
                    </span>
                  }
                />

                {submission.updated_at && (
                  <InfoRow
                    label="Last Updated"
                    value={
                      <span className="text-sm font-medium text-gray-800">
                        {new Date(
                          submission.updated_at
                        ).toLocaleString()}
                      </span>
                    }
                  />
                )}
              </div>
            </SectionCard>

            {/* Attachment */}
            {submission.attachment_path && (
              <SectionCard title="Attachment">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                      📎
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        File
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-gray-700">
                        {submission.attachment_path}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Submission Information */}
            <SectionCard title="Submission Information">
              <div className="space-y-5">

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Submission ID
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    #{submission.id}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Program ID
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    #{submission.program_id}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Submitted At
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {submission.submitted_at
                      ? new Date(
                          submission.submitted_at
                        ).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Quick Navigation */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Quick Navigation
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  to="/researcher/submissions"
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  My Submissions
                  <span>→</span>
                </Link>

                <Link
                  to={`/researcher/programs/${submission.program_id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  Bug Bounty Program
                  <span>→</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">

          <Link
            to="/researcher/submissions"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Back to My Submissions
          </Link>

          <Link
            to={`/researcher/programs/${submission.program_id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            View Bug Bounty Program
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}