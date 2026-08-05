import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, FilePlus2, Inbox } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { SeverityBadge } from "../../components/ui/SeverityBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { getReports } from "../../api/reports";
import { getErrorMessage } from "../../api/client";
import type { ReportListItem } from "../../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ReportsListPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getReports()
      .then((data) => {
        if (!cancelled) setReports(data);
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

  const filtered = reports.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
  const isAdmin = user?.role === "admin";

  return (
    <AppLayout title={isAdmin ? "All Reports" : "My Reports"}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white py-2 pl-9 pr-3 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </div>

        {!isAdmin && (
          <Link to="/reports/new">
            <Button>
              <FilePlus2 size={15} />
              Submit report
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[var(--color-ink-muted)]">Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox size={28} className="text-[var(--color-ink-faint)]" />
            <p className="text-sm font-medium text-[var(--color-ink)]">
              {reports.length === 0 ? "No reports yet" : "No reports match your search"}
            </p>
            {reports.length === 0 && !isAdmin && (
              <p className="text-sm text-[var(--color-ink-muted)]">
                Submit your first vulnerability report to see it triaged here.
              </p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">AI Severity</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr
                  key={report.id}
                  className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-canvas)]"
                >
                  <td className="px-5 py-3">
                    <Link to={`/reports/${report.id}`} className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]">
                      {report.title}
                    </Link>
                    <div className="font-mono text-xs text-[var(--color-ink-faint)]">#{report.id.toString().padStart(4, "0")}</div>
                  </td>
                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">{report.category}</td>
                  <td className="px-5 py-3">
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
                  <td className="px-5 py-3">
                    <StatusBadge name={report.status.name} isTerminal={report.status.is_terminal} />
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-[var(--color-ink-muted)]">
                    {formatDate(report.submission_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AppLayout>
  );
}
