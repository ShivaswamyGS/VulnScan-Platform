import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMySubmissions,
  type VulnerabilitySubmission,
} from "../../api/submissions";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<
    VulnerabilitySubmission[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setLoading(true);
        setError("");

        const data = await getMySubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error("Failed to load submissions:", err);
        setError("Unable to load your submissions.");
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const value = search.trim().toLowerCase();

      const matchesSearch =
        !value ||
        submission.title.toLowerCase().includes(value) ||
        submission.description.toLowerCase().includes(value) ||
        String(submission.id).includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        (submission.status || "pending").toLowerCase() === statusFilter;

      const matchesSeverity =
        severityFilter === "all" ||
        (submission.severity || "").toLowerCase() === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [submissions, search, statusFilter, severityFilter]);

  const totalSubmissions = submissions.length;

  const pendingSubmissions = submissions.filter((submission) =>
    ["pending", "submitted", "under_review"].includes(
      (submission.status || "").toLowerCase()
    )
  ).length;

  const acceptedSubmissions = submissions.filter((submission) =>
    ["accepted", "resolved", "approved", "paid"].includes(
      (submission.status || "").toLowerCase()
    )
  ).length;

  const totalBounty = submissions.reduce(
    (total, submission) =>
      total + Number(submission.bounty_amount || 0),
    0
  );

  function getStatusClass(status?: string | null) {
    const normalized = (status || "pending").toLowerCase();

    if (
      ["accepted", "resolved", "approved", "paid"].includes(normalized)
    ) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (
      ["rejected", "closed", "duplicate"].includes(normalized)
    ) {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (
      ["under_review", "reviewing"].includes(normalized)
    ) {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  function getSeverityClass(severity?: string | null) {
    const normalized = (severity || "").toLowerCase();

    if (normalized === "critical") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (normalized === "high") {
      return "border-orange-200 bg-orange-50 text-orange-700";
    }

    if (normalized === "medium") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (normalized === "low") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-gray-200 bg-gray-50 text-gray-600";
  }

  function formatStatus(status?: string | null) {
    return (status || "Pending")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-accent)]" />
            <h2 className="text-lg font-semibold text-slate-900">
              Loading submissions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fetching your vulnerability reports...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
              Researcher Portal
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              My Submissions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Track your vulnerability reports, review progress,
              severity and bounty payments from one place.
            </p>
          </div>

          <Link
            to="/researcher/programs"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
          >
            <span className="text-lg">+</span>
            Browse Programs
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-800">
                  Unable to load submissions
                </h2>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATS */}
        {!error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Total Submissions
                </p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  📄
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {totalSubmissions}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Vulnerability reports submitted
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Under Review
                </p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                  🔍
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {pendingSubmissions}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Reports awaiting review
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Accepted
                </p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                  ✓
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {acceptedSubmissions}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Successful vulnerability reports
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Total Bounty
                </p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                  ₹
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                ₹{totalBounty.toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Total bounty awarded
              </p>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && submissions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              📝
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No submissions yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't submitted any vulnerabilities yet.
              Explore available bug bounty programs and submit
              your first report.
            </p>

            <Link
              to="/researcher/programs"
              className="mt-6 inline-flex rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Find a Program
            </Link>
          </div>
        )}

        {/* MAIN CONTENT */}
        {!error && submissions.length > 0 && (
          <>
            {/* FILTER BAR */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold text-slate-900">
                  Submission Reports
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search and filter your submitted vulnerabilities.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor="submission-search"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Search
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      ⌕
                    </span>

                    <input
                      id="submission-search"
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search by title or ID..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-white focus:ring-2 focus:ring-[var(--color-accent)]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="status-filter"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Status
                  </label>

                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="severity-filter"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Severity
                  </label>

                  <select
                    id="severity-filter"
                    value={severityFilter}
                    onChange={(event) =>
                      setSeverityFilter(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-white"
                  >
                    <option value="all">All severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* NO RESULTS */}
            {filteredSubmissions.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl">
                  🔎
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  No matching submissions
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setSeverityFilter("all");
                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* DESKTOP TABLE */}
            {filteredSubmissions.length > 0 && (
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Submission
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Severity
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Bounty
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Submitted
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSubmissions.map((submission) => (
                        <tr
                          key={submission.id}
                          className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <div className="max-w-sm">
                              <p className="font-semibold text-slate-900">
                                {submission.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Submission #{submission.id}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getSeverityClass(
                                submission.severity
                              )}`}
                            >
                              {submission.severity || "Not rated"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                submission.status
                              )}`}
                            >
                              {formatStatus(submission.status)}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="font-semibold text-slate-900">
                              ₹
                              {Number(
                                submission.bounty_amount || 0
                              ).toFixed(2)}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {submission.submitted_at
                              ? new Date(
                                  submission.submitted_at
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              to={`/researcher/submissions/${submission.id}`}
                              className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-accent)] hover:bg-slate-50 hover:text-[var(--color-accent)]"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MOBILE */}
            {filteredSubmissions.length > 0 && (
              <div className="space-y-4 md:hidden">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">
                          Submission #{submission.id}
                        </p>

                        <h2 className="mt-1 font-semibold text-slate-900">
                          {submission.title}
                        </h2>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          submission.status
                        )}`}
                      >
                        {formatStatus(submission.status)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-xs text-slate-400">
                          Severity
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getSeverityClass(
                            submission.severity
                          )}`}
                        >
                          {submission.severity || "Not rated"}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Bounty
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          ₹
                          {Number(
                            submission.bounty_amount || 0
                          ).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {submission.submitted_at
                            ? new Date(
                                submission.submitted_at
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/researcher/submissions/${submission.id}`}
                      className="mt-5 inline-flex w-full justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Submission
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}