import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip, Sparkles } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { SeverityBadge } from "../../components/ui/SeverityBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getReport, downloadAttachment } from "../../api/reports";
import { getErrorMessage } from "../../api/client";
import type { Report } from "../../types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-ink)]">{children}</dd>
    </div>
  );
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    getReport(Number(id))
      .then((data) => {
        if (!cancelled) setReport(data);
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
  }, [id]);

  return (
    <AppLayout title="Report Details">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/reports"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={14} />
          Back to reports
        </Link>

        {isLoading && <div className="text-sm text-[var(--color-ink-muted)]">Loading report...</div>}
        {error && <Alert variant="error">{error}</Alert>}

        {report && (
          <div className="flex flex-col gap-5">
            <Card className="p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-ink)]">{report.title}</h2>
                  <p className="font-mono text-xs text-[var(--color-ink-faint)]">
                    #{report.id.toString().padStart(4, "0")} · submitted {formatDateTime(report.submission_date)}
                  </p>
                </div>
                <StatusBadge name={report.status.name} isTerminal={report.status.is_terminal} />
              </div>

              <dl className="grid grid-cols-2 gap-4">
                <DetailRow label="Affected module">{report.affected_module}</DetailRow>
                <DetailRow label="Category">{report.category}</DetailRow>
                <DetailRow label="Reported by">{report.reporter.full_name}</DetailRow>
                <DetailRow label="Priority">{report.priority ?? "Not yet assigned"}</DetailRow>
              </dl>

              <hr className="my-4 border-[var(--color-border)]" />

              <div className="flex flex-col gap-4">
                <DetailRow label="Description">{report.description}</DetailRow>
                <DetailRow label="Steps to reproduce">{report.steps_to_reproduce}</DetailRow>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Expected result">{report.expected_result}</DetailRow>
                  <DetailRow label="Actual result">{report.actual_result}</DetailRow>
                </div>
              </div>

              {report.attachment_path && (
                <button
                  onClick={() => downloadAttachment(report.id, report.attachment_path!)}
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  <Paperclip size={14} />
                  Download attachment
                </button>
              )}
            </Card>

            <Card className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--color-accent)]" />
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">AI Triage Result</h3>
              </div>

              {report.predictions.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-muted)]">No prediction available for this report yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <SeverityBadge
                      severity={report.predictions[0].predicted_severity}
                      confidence={report.predictions[0].confidence_score}
                    />
                    <span className="font-mono text-xs text-[var(--color-ink-faint)]">
                      model: {report.predictions[0].model_version}
                    </span>
                  </div>
                  {report.predictions[0].explanation && (
                    <p className="text-sm text-[var(--color-ink-muted)]">{report.predictions[0].explanation}</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
