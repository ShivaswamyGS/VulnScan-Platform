import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  FolderKanban,
  Users,
  BarChart3,
  ArrowUpRight,
  ShieldAlert,
  Clock3,
  CircleCheck,
  RefreshCw,
} from "lucide-react";

import CompanyLayout from "../../components/company/CompanyLayout";

import {
  getCompanySubmissions,
  type VulnerabilitySubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";


export default function CompanyDashboardPage() {
  const [submissions, setSubmissions] = useState<
    VulnerabilitySubmission[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);


  // =========================================================
  // LOAD COMPANY SUBMISSIONS
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const data = await getCompanySubmissions();

      setSubmissions(data ?? []);

    } catch (err) {

      console.error(
        "Failed to load company submissions:",
        err
      );

      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  }


  // =========================================================
  // SEVERITY COUNTS
  // =========================================================

  const totalReports = submissions.length;


  const criticalReports =
    submissions.filter(
      (submission) =>
        submission.severity?.toLowerCase() === "critical"
    ).length;


  const highReports =
    submissions.filter(
      (submission) =>
        submission.severity?.toLowerCase() === "high"
    ).length;


  const mediumReports =
    submissions.filter(
      (submission) =>
        submission.severity?.toLowerCase() === "medium"
    ).length;


  const lowReports =
    submissions.filter(
      (submission) =>
        submission.severity?.toLowerCase() === "low"
    ).length;


  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const resolvedReports =
    submissions.filter((submission) => {
      const status =
        submission.status?.toLowerCase();

      return (
        status === "resolved" ||
        status === "closed" ||
        status === "accepted"
      );
    }).length;


  const openReports =
    submissions.filter((submission) => {
      const status =
        submission.status?.toLowerCase();

      return ![
        "resolved",
        "closed",
        "accepted",
        "rejected",
      ].includes(status);
    }).length;


  // =========================================================
  // SEVERITY STYLE
  // =========================================================

  function severityClass(
    severity?: string | null
  ) {

    switch (severity?.toLowerCase()) {

      case "critical":
        return (
          "bg-red-50 text-red-700 ring-red-200"
        );

      case "high":
        return (
          "bg-orange-50 text-orange-700 ring-orange-200"
        );

      case "medium":
        return (
          "bg-amber-50 text-amber-700 ring-amber-200"
        );

      case "low":
        return (
          "bg-emerald-50 text-emerald-700 ring-emerald-200"
        );

      default:
        return (
          "bg-slate-50 text-slate-600 ring-slate-200"
        );
    }
  }


  // =========================================================
  // STATUS STYLE
  // =========================================================

  function statusClass(
    status?: string | null
  ) {

    switch (status?.toLowerCase()) {

      case "resolved":
      case "closed":
      case "accepted":

        return (
          "bg-emerald-50 text-emerald-700 ring-emerald-200"
        );


      case "rejected":

        return (
          "bg-red-50 text-red-700 ring-red-200"
        );


      case "triaged":
      case "in_review":
      case "review":

        return (
          "bg-blue-50 text-blue-700 ring-blue-200"
        );


      case "submitted":
      case "pending":
      case "new":

        return (
          "bg-amber-50 text-amber-700 ring-amber-200"
        );


      default:

        return (
          "bg-slate-50 text-slate-600 ring-slate-200"
        );
    }
  }


  // =========================================================
  // RECENT SUBMISSIONS
  // =========================================================

  const recentSubmissions =
    [...submissions]
      .sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime()
      )
      .slice(0, 10);


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <CompanyLayout title="Company Dashboard">

      <div className="min-h-full space-y-7">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-sm">

                <ShieldAlert size={21} />

              </div>


              <div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Company Dashboard
                </h1>

                <p className="mt-0.5 text-sm text-slate-500">
                  Monitor vulnerability activity and security reports.
                </p>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>

              <p className="font-semibold">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-red-600">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading ? (

          <div className="space-y-6">

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (

                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                  />

                )
              )}

            </div>


            <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          </div>

        ) : (

          <>

            {/* ================================================= */}
            {/* PRIMARY STATISTICS */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Total Reports"
                value={totalReports}
                description="All submitted reports"
                icon={
                  <FileWarning size={21} />
                }
                iconClass="bg-blue-50 text-blue-600"
              />


              <StatCard
                title="Open Reports"
                value={openReports}
                description="Require attention"
                icon={
                  <Clock3 size={21} />
                }
                iconClass="bg-amber-50 text-amber-600"
              />


              <StatCard
                title="Resolved Reports"
                value={resolvedReports}
                description="Successfully resolved"
                icon={
                  <CircleCheck size={21} />
                }
                iconClass="bg-emerald-50 text-emerald-600"
              />


              <StatCard
                title="Critical Reports"
                value={criticalReports}
                description="Highest severity"
                icon={
                  <ShieldAlert size={21} />
                }
                iconClass="bg-red-50 text-red-600"
              />

            </div>


            {/* ================================================= */}
            {/* SECURITY OVERVIEW */}
            {/* ================================================= */}

            <section>

              <div className="mb-4">

                <h2 className="text-lg font-bold text-slate-900">
                  Security Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current vulnerability distribution by severity.
                </p>

              </div>


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SeverityCard
                  title="Critical"
                  value={criticalReports}
                  icon={
                    <AlertTriangle size={19} />
                  }
                  wrapperClass="border-red-100 bg-red-50/50"
                  iconClass="bg-red-100 text-red-600"
                  valueClass="text-red-700"
                />


                <SeverityCard
                  title="High"
                  value={highReports}
                  icon={
                    <AlertTriangle size={19} />
                  }
                  wrapperClass="border-orange-100 bg-orange-50/50"
                  iconClass="bg-orange-100 text-orange-600"
                  valueClass="text-orange-700"
                />


                <SeverityCard
                  title="Medium"
                  value={mediumReports}
                  icon={
                    <FileWarning size={19} />
                  }
                  wrapperClass="border-amber-100 bg-amber-50/50"
                  iconClass="bg-amber-100 text-amber-600"
                  valueClass="text-amber-700"
                />


                <SeverityCard
                  title="Low"
                  value={lowReports}
                  icon={
                    <CheckCircle2 size={19} />
                  }
                  wrapperClass="border-emerald-100 bg-emerald-50/50"
                  iconClass="bg-emerald-100 text-emerald-600"
                  valueClass="text-emerald-700"
                />

              </div>

            </section>


            {/* ================================================= */}
            {/* RECENT VULNERABILITY REPORTS */}
            {/* ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:p-6 md:flex-row md:items-center">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">

                      <FileWarning size={18} />

                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Recent Vulnerability Reports
                    </h2>

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Latest vulnerability submissions received by your company.
                  </p>

                </div>


                <Link
                  to="/company/submissions"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] transition hover:opacity-80"
                >
                  View all submissions
                  <ArrowUpRight size={16} />
                </Link>

              </div>


              {recentSubmissions.length === 0 ? (

                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                    <FileWarning size={25} />

                  </div>


                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No vulnerability submissions yet
                  </h3>


                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    New vulnerability submissions will appear here once researchers submit them.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px] text-sm">

                    <thead>

                      <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Submission
                        </th>

                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Category
                        </th>

                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Severity
                        </th>

                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Submitted
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {recentSubmissions.map(
                        (submission) => {

                          const severity =
                            submission.severity ||
                            "Pending";

                          const status =
                            submission.status ||
                            "submitted";


                          return (

                            <tr
                              key={submission.id}
                              className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/60"
                            >

                              <td className="px-6 py-4">

                                <div className="max-w-[300px]">

                                  <p className="truncate font-semibold text-slate-900">
                                    {submission.title}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Submission #{submission.id}
                                  </p>

                                </div>

                              </td>


                              <td className="px-4 py-4 text-slate-600">

                                {submission.vulnerability_type ||
                                  "Vulnerability"}

                              </td>


                              <td className="px-4 py-4">

                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${severityClass(
                                    severity
                                  )}`}
                                >
                                  {severity}
                                </span>

                              </td>


                              <td className="px-4 py-4">

                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass(
                                    status
                                  )}`}
                                >
                                  {status.replace(
                                    /_/g,
                                    " "
                                  )}
                                </span>

                              </td>


                              <td className="px-6 py-4 text-slate-500">

                                <div className="flex items-center gap-2">

                                  <Clock3 size={14} />

                                  {submission.submitted_at
                                    ? new Date(
                                        submission.submitted_at
                                      ).toLocaleDateString()
                                    : "—"}

                                </div>

                              </td>

                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>


            {/* ================================================= */}
            {/* QUICK ACTIONS */}
            {/* ================================================= */}

            <section>

              <div className="mb-4">

                <h2 className="text-lg font-bold text-slate-900">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Quickly access the most-used company tools.
                </p>

              </div>


              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <QuickAction
                  to="/company/employees"
                  icon={<Users size={21} />}
                  title="Manage Employees"
                  description="Add and manage internal security testers."
                  iconClass="bg-blue-50 text-blue-600"
                />


                <QuickAction
                  to="/company/projects"
                  icon={
                    <FolderKanban size={21} />
                  }
                  title="Manage Projects"
                  description="Manage your company projects and assets."
                  iconClass="bg-violet-50 text-violet-600"
                />


                <QuickAction
                  to="/company/analytics"
                  icon={
                    <BarChart3 size={21} />
                  }
                  title="View Analytics"
                  description="Analyze vulnerability trends and activity."
                  iconClass="bg-emerald-50 text-emerald-600"
                />

              </div>

            </section>

          </>

        )}

      </div>

    </CompanyLayout>
  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {

  return (

    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>


        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


// =========================================================
// SEVERITY CARD
// =========================================================

function SeverityCard({
  title,
  value,
  icon,
  wrapperClass,
  iconClass,
  valueClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  wrapperClass: string;
  iconClass: string;
  valueClass: string;
}) {

  return (

    <div
      className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-sm ${wrapperClass}`}
    >

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
          >
            {icon}
          </div>

          <span className="text-sm font-semibold text-slate-700">
            {title}
          </span>

        </div>

      </div>


      <p
        className={`mt-4 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>


      <p className="mt-1 text-xs text-slate-500">
        Reports
      </p>

    </div>
  );
}


// =========================================================
// QUICK ACTION
// =========================================================

function QuickAction({
  to,
  icon,
  title,
  description,
  iconClass,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
}) {

  return (

    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>


        <ArrowUpRight
          size={18}
          className="text-slate-300 transition group-hover:text-slate-600"
        />

      </div>


      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>


      <p className="mt-1.5 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </Link>
  );
}