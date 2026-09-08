import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CompanyLayout from "../../components/company/CompanyLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  getCompanySubmissions,
  type VulnerabilitySubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function CompanySubmissionsPage() {
  const [submissions, setSubmissions] = useState<VulnerabilitySubmission[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getCompanySubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "resolved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "triaged":
      case "in_review":
      case "review":
        return "bg-yellow-100 text-yellow-700";

      case "duplicate":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getSeverityClass(severity?: string | null) {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-500";
    }
  }

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesSearch =
        !query ||
        submission.title.toLowerCase().includes(query) ||
        submission.description.toLowerCase().includes(query) ||
        String(submission.program_id).includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        submission.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesSeverity =
        severityFilter === "all" ||
        submission.severity?.toLowerCase() === severityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [submissions, search, statusFilter, severityFilter]);

  const pendingCount = submissions.filter((submission) =>
    ["pending", "submitted", "new"].includes(
      submission.status?.toLowerCase()
    )
  ).length;

  const criticalCount = submissions.filter(
    (submission) => submission.severity?.toLowerCase() === "critical"
  ).length;

  const resolvedCount = submissions.filter((submission) =>
    ["resolved", "accepted"].includes(submission.status?.toLowerCase())
  ).length;

  return (
    <CompanyLayout title="Bug Bounty Submissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-[var(--color-accent)]">
              Security Operations
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--color-ink)]">
              Vulnerability Submissions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-muted)]">
              Review, assess, and manage vulnerabilities reported by
              researchers across your Bug Bounty Programs.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSubmissions}
            disabled={isLoading}
            className="inline-flex w-fit items-center rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↻ {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Stats */}
        {!isLoading && submissions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Total Reports
              </p>

              <p className="mt-2 text-2xl font-bold text-[var(--color-ink)]">
                {submissions.length}
              </p>

              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                All submitted vulnerabilities
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Pending Review
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-600">
                {pendingCount}
              </p>

              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Require attention
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Critical
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {criticalCount}
              </p>

              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Highest severity reports
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Resolved
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {resolvedCount}
              </p>

              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Accepted or resolved
              </p>
            </Card>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-accent)]" />

            <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
              Loading vulnerability submissions...
            </p>
          </Card>
        ) : submissions.length === 0 ? (
          /* Empty */
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              ✓
            </div>

            <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)]">
              No Vulnerability Submissions
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-ink-muted)]">
              No researchers have submitted vulnerabilities to your Bug
              Bounty Programs yet.
            </p>
          </Card>
        ) : (
          <>
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, description or program..."
                    className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="triaged">Triaged</option>
                  <option value="in_review">In Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="duplicate">Duplicate</option>
                </select>

                <select
                  value={severityFilter}
                  onChange={(event) =>
                    setSeverityFilter(event.target.value)
                  }
                  className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {(search ||
                statusFilter !== "all" ||
                severityFilter !== "all") && (
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    Showing {filteredSubmissions.length} of{" "}
                    {submissions.length} submissions
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setSeverityFilter("all");
                    }}
                    className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </Card>

            {/* Table */}
            {filteredSubmissions.length === 0 ? (
              <Card className="p-10 text-center">
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                  No matching submissions
                </h3>

                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  Try changing your search or filters.
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="border-b p-5">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-ink)]">
                        Researcher Reports
                      </h2>

                      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                        Select a report to review its complete details.
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {filteredSubmissions.length} report
                      {filteredSubmissions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-5 py-3 text-left font-medium">
                          Vulnerability
                        </th>

                        <th className="px-5 py-3 text-left font-medium">
                          Program
                        </th>

                        <th className="px-5 py-3 text-left font-medium">
                          Severity
                        </th>

                        <th className="px-5 py-3 text-left font-medium">
                          Status
                        </th>

                        <th className="px-5 py-3 text-left font-medium">
                          Bounty
                        </th>

                        <th className="px-5 py-3 text-left font-medium">
                          Submitted
                        </th>

                        <th className="px-5 py-3 text-right font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSubmissions.map((submission) => (
                        <tr
                          key={submission.id}
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="max-w-sm">
                              <p className="font-medium text-[var(--color-ink)]">
                                {submission.title}
                              </p>

                              <p className="mt-1 truncate text-xs text-[var(--color-ink-muted)]">
                                {submission.description ||
                                  "No description provided."}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                Submission #{submission.id}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                              Program #{submission.program_id}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getSeverityClass(
                                submission.severity
                              )}`}
                            >
                              {submission.severity || "Not assessed"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                submission.status
                              )}`}
                            >
                              {submission.status || "Pending"}
                            </span>
                          </td>

                          <td className="px-5 py-4 font-medium">
                            {submission.bounty_amount !== null &&
                            submission.bounty_amount !== undefined
                              ? `₹${Number(
                                  submission.bounty_amount
                                ).toLocaleString("en-IN")}`
                              : "-"}
                          </td>

                          <td className="px-5 py-4 text-xs text-[var(--color-ink-muted)]">
                            {submission.submitted_at
                              ? new Date(
                                  submission.submitted_at
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              to={`/company/submissions/${submission.id}`}
                              className="inline-flex items-center rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                            >
                              Review →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </CompanyLayout>
  );
}