import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  BarChart3,
  FileWarning,
} from "lucide-react";

import CompanyLayout from "../../components/company/CompanyLayout";
import { getCompanyDashboardStats } from "../../api/companyDashboard";
import { getErrorMessage } from "../../api/client";

import type { DashboardStats } from "../../types";

const emptyStats: DashboardStats = {
  total_reports: 0,
  critical_reports: 0,
  high_reports: 0,
  medium_reports: 0,
  low_reports: 0,
  open_reports: 0,
  resolved_reports: 0,
  severity_distribution: {},
  status_distribution: {},
  recent_reports: [],
};

export default function CompanyAnalyticsPage() {
  const [stats, setStats] =
    useState<DashboardStats>(emptyStats);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getCompanyDashboardStats();

      setStats({
        ...emptyStats,
        ...data,
        recent_reports:
          data.recent_reports ?? [],
        severity_distribution:
          data.severity_distribution ?? {},
        status_distribution:
          data.status_distribution ?? {},
      });
    } catch (err) {
      console.error(
        "Failed to load analytics:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const totalSeverity =
    stats.critical_reports +
    stats.high_reports +
    stats.medium_reports +
    stats.low_reports;

  function percentage(
    value: number,
    total: number
  ) {
    if (total === 0) return 0;

    return Math.round(
      (value / total) * 100
    );
  }

  return (
    <CompanyLayout title="Analytics">

      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">
          Loading analytics...
        </div>
      ) : (
        <div className="space-y-6">

          {/* Header */}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Vulnerability Analytics
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Security insights from reports submitted by your employees
            </p>
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Overview */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <BarChart3
                  size={22}
                  className="text-blue-600"
                />

                <span className="text-sm text-gray-500">
                  Total Reports
                </span>

              </div>

              <p className="mt-3 text-3xl font-bold">
                {stats.total_reports}
              </p>

            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <FileWarning
                  size={22}
                  className="text-orange-500"
                />

                <span className="text-sm text-gray-500">
                  Open
                </span>

              </div>

              <p className="mt-3 text-3xl font-bold text-orange-500">
                {stats.open_reports}
              </p>

            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <CheckCircle
                  size={22}
                  className="text-green-600"
                />

                <span className="text-sm text-gray-500">
                  Resolved
                </span>

              </div>

              <p className="mt-3 text-3xl font-bold text-green-600">
                {stats.resolved_reports}
              </p>

            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <AlertTriangle
                  size={22}
                  className="text-red-600"
                />

                <span className="text-sm text-gray-500">
                  Critical
                </span>

              </div>

              <p className="mt-3 text-3xl font-bold text-red-600">
                {stats.critical_reports}
              </p>

            </div>

          </div>

          {/* Severity Distribution */}

          <div className="rounded-xl bg-white p-6 shadow">

            <div className="mb-6">

              <h2 className="text-xl font-bold">
                Severity Distribution
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                AI-predicted severity of vulnerability reports
              </p>

            </div>

            <div className="space-y-5">

              {/* Critical */}

              <SeverityBar
                label="Critical"
                value={stats.critical_reports}
                total={totalSeverity}
                className="bg-red-500"
              />

              {/* High */}

              <SeverityBar
                label="High"
                value={stats.high_reports}
                total={totalSeverity}
                className="bg-orange-500"
              />

              {/* Medium */}

              <SeverityBar
                label="Medium"
                value={stats.medium_reports}
                total={totalSeverity}
                className="bg-yellow-500"
              />

              {/* Low */}

              <SeverityBar
                label="Low"
                value={stats.low_reports}
                total={totalSeverity}
                className="bg-green-500"
              />

            </div>

          </div>

          {/* Status + Severity */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Status */}

            <div className="rounded-xl bg-white p-6 shadow">

              <h2 className="text-xl font-bold">
                Report Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current lifecycle status of reports
              </p>

              <div className="mt-6 space-y-4">

                {Object.entries(
                  stats.status_distribution
                ).map(
                  ([status, count]) => (

                    <div
                      key={status}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >

                      <span className="text-sm font-medium text-gray-700">
                        {status}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                        {count}
                      </span>

                    </div>

                  )
                )}

                {Object.keys(
                  stats.status_distribution
                ).length === 0 && (

                  <p className="py-6 text-center text-sm text-gray-500">
                    No status data available.
                  </p>

                )}

              </div>

            </div>

            {/* Severity Summary */}

            <div className="rounded-xl bg-white p-6 shadow">

              <h2 className="text-xl font-bold">
                Severity Summary
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Percentage of reports by severity
              </p>

              <div className="mt-6 space-y-4">

                <SummaryRow
                  label="Critical"
                  value={stats.critical_reports}
                  percentage={percentage(
                    stats.critical_reports,
                    totalSeverity
                  )}
                />

                <SummaryRow
                  label="High"
                  value={stats.high_reports}
                  percentage={percentage(
                    stats.high_reports,
                    totalSeverity
                  )}
                />

                <SummaryRow
                  label="Medium"
                  value={stats.medium_reports}
                  percentage={percentage(
                    stats.medium_reports,
                    totalSeverity
                  )}
                />

                <SummaryRow
                  label="Low"
                  value={stats.low_reports}
                  percentage={percentage(
                    stats.low_reports,
                    totalSeverity
                  )}
                />

              </div>

            </div>

          </div>

        </div>
      )}

    </CompanyLayout>
  );
}


/* ================================
   Severity Bar
================================ */

interface SeverityBarProps {
  label: string;
  value: number;
  total: number;
  className: string;
}

function SeverityBar({
  label,
  value,
  total,
  className,
}: SeverityBarProps) {
  const percent =
    total === 0
      ? 0
      : Math.round(
          (value / total) * 100
        );

  return (
    <div>

      <div className="mb-2 flex justify-between text-sm">

        <span className="font-medium">
          {label}
        </span>

        <span className="text-gray-500">
          {value} ({percent}%)
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-100">

        <div
          className={`h-full rounded-full ${className}`}
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  );
}


/* ================================
   Summary Row
================================ */

interface SummaryRowProps {
  label: string;
  value: number;
  percentage: number;
}

function SummaryRow({
  label,
  value,
  percentage,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">

      <div>
        <p className="font-medium">
          {label}
        </p>

        <p className="text-xs text-gray-500">
          {percentage}% of reports
        </p>
      </div>

      <span className="text-xl font-bold">
        {value}
      </span>

    </div>
  );
}