import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { FileWarning, ShieldCheck, ShieldAlert, ShieldX, Inbox, CircleCheck, FolderOpen } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Alert } from "../../components/ui/Alert";
import { SeverityBadge } from "../../components/ui/SeverityBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getDashboardStats } from "../../api/dashboard";
import { getErrorMessage } from "../../api/client";
import type { DashboardStats } from "../../types";

// Hex duplicates of the severity tokens in index.css — kept literal here
// because SVG fill inside recharts doesn't reliably resolve CSS custom
// properties across browsers, unlike our regular Tailwind-classed markup.
const SEVERITY_COLORS: Record<string, string> = {
  critical: "#DC2626",
  high: "#EA580C",
  medium: "#D97706",
  low: "#0891B2",
};

const STATUS_COLORS = ["#2563EB", "#7C3AED", "#D97706", "#059669", "#64748B"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const severityChartData = stats
    ? (["critical", "high", "medium", "low"] as const).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: stats.severity_distribution[key] ?? 0,
        color: SEVERITY_COLORS[key],
      }))
    : [];

  const statusChartData = stats
    ? Object.entries(stats.status_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <AppLayout title="Admin Dashboard">
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {isLoading ? (
        <div className="p-10 text-center text-sm text-[var(--color-ink-muted)]">Loading dashboard...</div>
      ) : stats ? (
        <div className="flex flex-col gap-6">
          {/* --- Stat cards --- */}
          <div className="grid grid-cols-4 gap-4 lg:grid-cols-7">
            <StatCard label="Total Reports" value={stats.total_reports} icon={Inbox} />
            <StatCard label="Critical" value={stats.critical_reports} icon={ShieldX} accentColor={SEVERITY_COLORS.critical} />
            <StatCard label="High" value={stats.high_reports} icon={ShieldAlert} accentColor={SEVERITY_COLORS.high} />
            <StatCard label="Medium" value={stats.medium_reports} icon={FileWarning} accentColor={SEVERITY_COLORS.medium} />
            <StatCard label="Low" value={stats.low_reports} icon={ShieldCheck} accentColor={SEVERITY_COLORS.low} />
            <StatCard label="Open" value={stats.open_reports} icon={FolderOpen} accentColor="#64748B" />
            <StatCard label="Resolved" value={stats.resolved_reports} icon={CircleCheck} accentColor="#059669" />
          </div>

          {/* --- Charts --- */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={severityChartData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 6, borderColor: "#E2E8F0", fontSize: 13 }}
                    cursor={{ fill: "#F8FAFC" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {severityChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {statusChartData.map((entry, i) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 6, borderColor: "#E2E8F0", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                {statusChartData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }}
                    />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* --- Recent reports --- */}
          <Card className="overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-5 py-3">
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">Recent Reports</h3>
            </div>
            {stats.recent_reports.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--color-ink-muted)]">No reports submitted yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                    <th className="px-5 py-2.5 font-medium">Title</th>
                    <th className="px-5 py-2.5 font-medium">Category</th>
                    <th className="px-5 py-2.5 font-medium">AI Severity</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_reports.map((report) => (
                    <tr key={report.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-canvas)]">
                      <td className="px-5 py-2.5">
                        <Link to={`/reports/${report.id}`} className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]">
                          {report.title}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-[var(--color-ink-muted)]">{report.category}</td>
                      <td className="px-5 py-2.5">
                        {report.latest_prediction ? (
                          <SeverityBadge
                            severity={report.latest_prediction.predicted_severity}
                            confidence={report.latest_prediction.confidence_score}
                            size="sm"
                          />
                        ) : (
                          <span className="text-xs text-[var(--color-ink-faint)]">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        <StatusBadge name={report.status.name} isTerminal={report.status.is_terminal} />
                      </td>
                      <td className="px-5 py-2.5 font-mono text-xs text-[var(--color-ink-muted)]">
                        {formatDate(report.submission_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      ) : null}
    </AppLayout>
  );
}
