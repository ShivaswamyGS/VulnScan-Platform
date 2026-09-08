import { useEffect, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { Link } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";

import {
  getDashboardStats,
  type DashboardStats,
  type ReportListItem,
} from "../../api/dashboard";

import { getErrorMessage } from "../../api/client";

import DashboardCards from "../../components/dashboard/DashboardCards";

import DashboardCharts from "../../components/dashboard/DashboardCharts";


function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function getSeverity(
  report: ReportListItem
) {
  const prediction =
    report.latest_prediction;

  if (
    prediction?.prediction
  ) {
    return prediction.prediction.toLowerCase();
  }

  return "unknown";
}


function severityClasses(
  severity: string
) {
  switch (severity) {
    case "critical":
      return "bg-red-50 text-red-700 border-red-200";

    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "low":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}


function statusClasses(
  status: string
) {
  const normalized =
    status.toLowerCase();

  if (
    normalized.includes("resolved") ||
    normalized.includes("closed") ||
    normalized.includes("accepted")
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    normalized.includes("progress") ||
    normalized.includes("review")
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
}


function MiniSeverityBar({
  label,
  value,
  total,
  className,
}: {
  label: string;
  value: number;
  total: number;
  className: string;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div className="space-y-2">

      <div className="flex items-center justify-between text-xs">

        <span className="font-medium text-slate-600">
          {label}
        </span>

        <span className="font-semibold text-slate-800">
          {value}
        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${className}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="text-[10px] text-slate-400">
        {percentage}% of reports
      </p>

    </div>
  );
}


function RecentReportsTable({
  reports,
}: {
  reports: ReportListItem[];
}) {
  return (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[720px] text-left">

        <thead>

          <tr className="border-b border-slate-200 bg-slate-50/70">

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Report
            </th>

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Category
            </th>

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Severity
            </th>

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Submitted
            </th>

          </tr>

        </thead>

        <tbody>

          {reports.map((report) => {

            const severity =
              getSeverity(report);

            const status =
              report.status?.name ??
              "Unknown";

            return (
              <tr
                key={report.id}
                className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
              >

                <td className="px-5 py-4">

                  <div className="flex items-start gap-3">

                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                      <FileSearch size={15} />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-[12px] font-semibold text-slate-800">
                        {report.title}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        #{String(report.id).padStart(4, "0")}
                      </p>

                    </div>

                  </div>

                </td>

                <td className="px-5 py-4 text-[11px] text-slate-500">
                  {report.category || "-"}
                </td>

                <td className="px-5 py-4">

                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                      "text-[10px] font-medium capitalize",
                      severityClasses(severity),
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />

                    {severity === "unknown"
                      ? "Pending"
                      : severity}
                  </span>

                </td>

                <td className="px-5 py-4">

                  <span
                    className={[
                      "inline-flex rounded-md border px-2.5 py-1",
                      "text-[10px] font-medium",
                      statusClasses(status),
                    ].join(" ")}
                  >
                    {status}
                  </span>

                </td>

                <td className="px-5 py-4 text-[10px] text-slate-500">
                  {formatDate(
                    report.submission_date
                  )}
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}


export default function AdminDashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  async function loadDashboard() {
    try {

      setIsLoading(true);

      setError(null);

      const data =
        await getDashboardStats();

      setStats(data);

    } catch (err) {

      console.error(err);

      setError(
        getErrorMessage(err)
      );

    } finally {

      setIsLoading(false);

    }
  }


  useEffect(() => {
    loadDashboard();
  }, []);


  if (isLoading) {
    return (
      <AppLayout title="Dashboard">

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-10 w-10 animate-pulse items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShieldAlert size={20} />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-700">
              Loading security dashboard
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching current vulnerability intelligence...
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }


  if (!stats) {
    return (
      <AppLayout title="Dashboard">

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-3">

            <ShieldAlert
              size={18}
              className="mt-0.5 text-red-600"
            />

            <div>

              <h2 className="text-sm font-semibold text-red-800">
                Dashboard unavailable
              </h2>

              <p className="mt-1 text-xs text-red-700">
                {error ||
                  "Unable to load dashboard data."}
              </p>

              <button
                onClick={loadDashboard}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
              >
                <RefreshCw size={13} />
                Try again
              </button>

            </div>

          </div>

        </div>

      </AppLayout>
    );
  }


  const severityTotal =
    stats.critical_reports +
    stats.high_reports +
    stats.medium_reports +
    stats.low_reports;


  return (
    <AppLayout title="Dashboard">

      <div className="space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                System operational
              </span>

            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Security Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor vulnerability activity, AI triage,
              and remediation progress.
            </p>

          </div>

          <button
            onClick={loadDashboard}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw size={14} />
            Refresh data
          </button>

        </div>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <DashboardCards stats={stats} />


        {/* =====================================================
            ANALYTICS
        ===================================================== */}

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">

          {/* Severity Overview */}

          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  Vulnerability Severity
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Distribution of findings by severity
                </p>

              </div>

              <TrendingUp
                size={17}
                className="text-blue-500"
              />

            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">

              <MiniSeverityBar
                label="Critical"
                value={stats.critical_reports}
                total={severityTotal}
                className="bg-red-600"
              />

              <MiniSeverityBar
                label="High"
                value={stats.high_reports}
                total={severityTotal}
                className="bg-orange-500"
              />

              <MiniSeverityBar
                label="Medium"
                value={stats.medium_reports}
                total={severityTotal}
                className="bg-amber-500"
              />

              <MiniSeverityBar
                label="Low"
                value={stats.low_reports}
                total={severityTotal}
                className="bg-cyan-600"
              />

            </div>

          </div>


          {/* Status Overview */}

          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  Report Status
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Current workflow distribution
                </p>

              </div>

              <Clock3
                size={17}
                className="text-blue-500"
              />

            </div>

            <div className="mt-5 space-y-3">

              {Object.entries(
                stats.status_distribution || {}
              ).length === 0 ? (

                <div className="rounded-lg bg-slate-50 p-5 text-center text-xs text-slate-400">
                  No status data available.
                </div>

              ) : (

                Object.entries(
                  stats.status_distribution
                )
                  .slice(0, 6)
                  .map(([status, count]) => (

                    <div
                      key={status}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3.5 py-3"
                    >

                      <div className="flex items-center gap-2.5">

                        <span className="h-2 w-2 rounded-full bg-blue-500" />

                        <span className="text-xs font-medium capitalize text-slate-600">
                          {status}
                        </span>

                      </div>

                      <span className="text-sm font-semibold text-slate-900">
                        {count}
                      </span>

                    </div>

                  ))

              )}

            </div>

          </div>

        </div>


        {/* =====================================================
            CHART + CRITICAL
        ===================================================== */}

        <div className="grid gap-5 lg:grid-cols-2">

          <DashboardCharts stats={stats} />


          {/* Critical Vulnerabilities */}

          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

            <div className="flex items-start justify-between border-b border-slate-100 p-6">

              <div>

                <div className="flex items-center gap-2">

                  <ShieldAlert
                    size={16}
                    className="text-red-600"
                  />

                  <h2 className="text-sm font-semibold text-slate-900">
                    Critical Vulnerabilities
                  </h2>

                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  Findings requiring immediate attention
                </p>

              </div>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
                {stats.critical_vulnerabilities.length}
              </span>

            </div>

            {stats.critical_vulnerabilities.length ===
            0 ? (

              <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={19} />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No critical vulnerabilities
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Everything looks clear right now.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {stats.critical_vulnerabilities
                  .slice(0, 5)
                  .map((report) => (

                    <Link
                      key={report.id}
                      to={`/reports/${report.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >

                      <div className="min-w-0">

                        <p className="truncate text-xs font-semibold text-slate-800">
                          {report.title}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {report.category || "Security finding"}
                        </p>

                      </div>

                      <ArrowRight
                        size={14}
                        className="shrink-0 text-slate-300"
                      />

                    </Link>

                  ))}

              </div>

            )}

          </div>

        </div>


        {/* =====================================================
            RECENT REPORTS
        ===================================================== */}

        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

          <div className="flex items-center justify-between border-b border-slate-100 p-6">

            <div>

              <h2 className="text-sm font-semibold text-slate-900">
                Recent Reports
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Latest vulnerability submissions received by the platform
              </p>

            </div>

            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowRight size={13} />
            </Link>

          </div>

          {stats.recent_reports.length ===
          0 ? (

            <div className="p-10 text-center">

              <FileSearch
                size={25}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No recent reports
              </p>

              <p className="mt-1 text-xs text-slate-400">
                New vulnerability reports will appear here.
              </p>

            </div>

          ) : (

            <RecentReportsTable
              reports={stats.recent_reports.slice(
                0,
                8
              )}
            />

          )}

        </div>


        {/* =====================================================
            FOOTER SUMMARY
        ===================================================== */}

        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <span>
            VulnTriage Security Operations Platform
          </span>

          <span>
            AI-assisted vulnerability triage
          </span>

        </div>

      </div>

    </AppLayout>
  );
}