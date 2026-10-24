import { useCallback, useEffect, useState } from "react";
import { RefreshCw, FileText, ShieldAlert, AlertTriangle, Clock3 } from "lucide-react";

import { AppLayout } from "../../components/layout/AppLayout";
import { getDashboardStats, type DashboardStats } from "../../api/dashboard";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SeverityBars({ stats }: { stats: DashboardStats }) {
  const total = Math.max(stats.total_reports, 1);

  const items = [
    {
      label: "Critical",
      value: stats.critical_reports,
      className: "bg-red-500",
    },
    {
      label: "High",
      value: stats.high_reports,
      className: "bg-orange-500",
    },
    {
      label: "Medium",
      value: stats.medium_reports,
      className: "bg-yellow-500",
    },
    {
      label: "Low",
      value: stats.low_reports,
      className: "bg-cyan-500",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Vulnerability Severity
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Distribution of findings by severity
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item) => {
          const percentage = Math.round((item.value / total) * 100);

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">
                  {item.label}
                </span>

                <span className="text-xs font-semibold text-slate-700">
                  {item.value}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.className}`}
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[10px] text-slate-400">
                {percentage}% of reports
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReportStatus({ stats }: { stats: DashboardStats }) {
  const statuses = Object.entries(stats.status_distribution || {});

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Report Status
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Current workflow distribution
            </p>
          </div>

          <Clock3 size={16} className="text-blue-500" />
        </div>
      </div>

      <div className="space-y-3">
        {statuses.length === 0 ? (
          <div className="rounded-lg border border-slate-100 p-4 text-center text-xs text-slate-400">
            No status data available
          </div>
        ) : (
          statuses.map(([status, count]) => (
            <div
              key={status}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-500" />

                <span className="text-xs font-medium text-slate-600">
                  {status}
                </span>
              </div>

              <span className="text-xs font-semibold text-slate-800">
                {count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SeverityDistribution({ stats }: { stats: DashboardStats }) {
  const total =
    stats.critical_reports +
    stats.high_reports +
    stats.medium_reports +
    stats.low_reports;

  if (total === 0) {
    return (
      <div className="flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          —
        </div>

        <p className="mt-4 text-sm font-medium text-slate-500">
          No vulnerability data
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Severity distribution will appear here.
        </p>
      </div>
    );
  }

  const values = [
    { label: "Critical", value: stats.critical_reports, color: "#ef4444" },
    { label: "High", value: stats.high_reports, color: "#f97316" },
    { label: "Medium", value: stats.medium_reports, color: "#eab308" },
    { label: "Low", value: stats.low_reports, color: "#06b6d4" },
  ];

  const criticalPercentage = (stats.critical_reports / total) * 100;
  const highPercentage = (stats.high_reports / total) * 100;
  const mediumPercentage = (stats.medium_reports / total) * 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Severity Distribution
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Vulnerability severity across all reports
          </p>
        </div>

        <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
          {total} findings
        </span>
      </div>

      <div className="flex min-h-[280px] flex-col items-center justify-center">
        <div
          className="relative h-48 w-48 rounded-full"
          style={{
            background: `conic-gradient(
              ${values[0].color} 0% ${criticalPercentage}%,
              ${values[1].color} ${criticalPercentage}% ${
              criticalPercentage + highPercentage
            }%,
              ${values[2].color} ${
              criticalPercentage + highPercentage
            }% ${
              criticalPercentage + highPercentage + mediumPercentage
            }%,
              ${values[3].color} ${
              criticalPercentage + highPercentage + mediumPercentage
            }% 100%
            )`,
          }}
        >
          <div className="absolute inset-8 flex items-center justify-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Findings
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-5">
          {values.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-[11px] text-slate-500">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function CriticalVulnerabilities({
  stats,
}: {
  stats: DashboardStats;
}) {
  // Protect the dashboard when the API omits this optional array.
  const vulnerabilities = Array.isArray(
    stats?.critical_vulnerabilities
  )
    ? stats.critical_vulnerabilities
    : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500" />

            <h2 className="text-sm font-semibold text-slate-900">
              Critical Vulnerabilities
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Findings requiring immediate attention
          </p>
        </div>

        <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-500">
          {vulnerabilities.length}
        </span>
      </div>

      <div>
        {vulnerabilities.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No critical vulnerabilities.
          </div>
        ) : (
          vulnerabilities.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between border-b border-slate-100 px-6 py-4 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {report.title}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {report.category}
                </p>
              </div>

              <span className="ml-4 text-slate-300">
                →
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


function RecentReports({ stats }: { stats: DashboardStats }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Reports
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Latest vulnerability submissions received by the platform
          </p>
        </div>

        <a
          href="/reports"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View all →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Report
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Category
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Severity
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Submitted
              </th>
            </tr>
          </thead>

          <tbody>
            {stats.recent_reports.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-xs text-slate-400"
                >
                  No recent reports.
                </td>
              </tr>
            ) : (
              stats.recent_reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-6 py-4">
                    <p className="text-xs font-semibold text-slate-800">
                      {report.title}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      #{String(report.id).padStart(4, "0")}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {report.category}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
                      {report.latest_prediction?.prediction || "Pending"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600">
                      {report.status?.name || "Unknown"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(report.submission_date).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getDashboardStats();

      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <RefreshCw className="animate-spin" size={18} />
            Loading dashboard...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !stats) {
    return (
      <AppLayout title="Dashboard">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">
            {error || "Dashboard data unavailable."}
          </p>

          <button
            onClick={() => loadDashboard(true)}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white"
          >
            Try again
          </button>
        </div>
      </AppLayout>
    );
  }

  const resolutionRate =
    stats.total_reports > 0
      ? Math.round((stats.resolved_reports / stats.total_reports) * 100)
      : 0;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                System Operational
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Security Overview
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor vulnerability activity, AI triage, and remediation
              progress.
            </p>
          </div>

          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />

            Refresh data
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Reports"
            value={stats.total_reports}
            subtitle="All vulnerability reports"
            icon={<FileText size={18} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Critical"
            value={stats.critical_reports}
            subtitle="Immediate attention required"
            icon={<ShieldAlert size={18} />}
            iconClass="bg-red-50 text-red-500"
          />

          <StatCard
            title="High Severity"
            value={stats.high_reports}
            subtitle="High-priority vulnerabilities"
            icon={<AlertTriangle size={18} />}
            iconClass="bg-orange-50 text-orange-500"
          />

          <StatCard
            title="Open Reports"
            value={stats.open_reports}
            subtitle="Currently awaiting resolution"
            icon={<Clock3 size={18} />}
            iconClass="bg-cyan-50 text-cyan-600"
          />

          <StatCard
            title="Medium"
            value={stats.medium_reports}
            subtitle="Moderate security findings"
            icon={<AlertTriangle size={18} />}
            iconClass="bg-yellow-50 text-yellow-600"
          />

          <StatCard
            title="Low"
            value={stats.low_reports}
            subtitle="Low-priority findings"
            icon={<AlertTriangle size={18} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Resolved"
            value={stats.resolved_reports}
            subtitle="Successfully resolved reports"
            icon={<ShieldAlert size={18} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            subtitle="Percentage of reports resolved"
            icon={<ShieldAlert size={18} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Severity + Status */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <SeverityBars stats={stats} />
          <ReportStatus stats={stats} />
        </div>

        {/* Distribution + Critical */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1fr]">
          <SeverityDistribution stats={stats} />
          <CriticalVulnerabilities stats={stats} />
        </div>

        {/* Remediation */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Remediation Progress
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current resolution performance
              </p>
            </div>

            <span className="text-xs text-emerald-500">
              resolution rate
            </span>
          </div>

          <div className="mt-6">
            <div className="text-3xl font-bold text-slate-900">
              {resolutionRate}%
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${resolutionRate}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Open
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-800">
                {stats.open_reports}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">
                Resolved
              </p>

              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {stats.resolved_reports}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <RecentReports stats={stats} />
      </div>
    </AppLayout>
  );
}