import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Paperclip,
  Sparkles,
  Copy,
  CalendarDays,
  User,
  ShieldAlert,
  Target,
  FileText,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock3,
} from "lucide-react";

import {
  getDuplicateReports,
  type DuplicateReportsResponse,
} from "../../api/duplicates";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { SeverityBadge } from "../../components/ui/SeverityBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";

import {
  getReport,
  downloadAttachment,
} from "../../api/reports";

import { getErrorMessage } from "../../api/client";
import type { Report, Severity } from "../../types";
import { useAuth } from "../../context/AuthContext";

import {
  getPredictionHistory,
  rerunPrediction,
  type Prediction,
} from "../../api/predictions";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailRow({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
        {icon}
        {label}
      </dt>

      <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-ink)]">
        {children}
      </dd>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3">
      <div className="text-[var(--color-accent)]">{icon}</div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-[var(--color-ink)]">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [report, setReport] = useState<Report | null>(null);

  const [predictionHistory, setPredictionHistory] =
    useState<Prediction[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [predictionError, setPredictionError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isPredictionLoading, setIsPredictionLoading] =
    useState(false);

  const [isRerunning, setIsRerunning] =
    useState(false);

  const [duplicates, setDuplicates] =
    useState<DuplicateReportsResponse | null>(null);

  const [duplicateLoading, setDuplicateLoading] =
    useState(false);

  const [duplicateError, setDuplicateError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        setPredictionError(null);

        const reportId = Number(id);

        const reportData = await getReport(reportId);

        if (cancelled) return;

        setReport(reportData);

        try {
          setIsPredictionLoading(true);

          const history =
            await getPredictionHistory(reportId);

          if (!cancelled) {
            setPredictionHistory(history);
          }
        } catch (predictionErr) {
          console.error(predictionErr);

          if (!cancelled) {
            setPredictionError(
              getErrorMessage(predictionErr)
            );
          }
        } finally {
          if (!cancelled) {
            setIsPredictionLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    setDuplicateLoading(true);
    setDuplicateError(null);

    getDuplicateReports(Number(id))
      .then((data) => {
        if (!cancelled) {
          setDuplicates(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDuplicateError(
            getErrorMessage(err)
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDuplicateLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleRerunPrediction() {
    if (!id) return;

    try {
      setIsRerunning(true);
      setPredictionError(null);

      const newPrediction =
        await rerunPrediction(Number(id));

      setPredictionHistory((previous) => [
        newPrediction,
        ...previous,
      ]);

      const updatedReport =
        await getReport(Number(id));

      setReport(updatedReport);
    } catch (err) {
      console.error(err);

      setPredictionError(
        getErrorMessage(err)
      );
    } finally {
      setIsRerunning(false);
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Report Details">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b p-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-lg bg-gray-100"
                />
              ))}
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Report Details">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/reports"
          className="mb-5 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-[var(--color-ink-muted)] transition hover:bg-gray-100 hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={15} />
          Back to reports
        </Link>

        {error && (
          <div className="mb-5">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {report && (
          <div className="flex flex-col gap-5">

            {/* =====================================================
                REPORT HEADER
            ===================================================== */}

            <Card className="overflow-hidden">
              <div className="border-b border-[var(--color-border)] p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[var(--color-canvas)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--color-ink-muted)]">
                        #
                        {report.id
                          .toString()
                          .padStart(4, "0")}
                      </span>

                      <StatusBadge
                        name={report.status.name}
                        isTerminal={
                          report.status.is_terminal
                        }
                      />
                    </div>

                    <h1 className="break-words text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                      {report.title}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-ink-muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        Submitted{" "}
                        {formatDateTime(
                          report.submission_date
                        )}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <User size={13} />
                        {report.reporter.full_name}
                      </span>
                    </div>
                  </div>

                  {report.priority && (
                    <div className="shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                        Priority
                      </p>

                      <p className="mt-1 text-lg font-bold text-[var(--color-ink)]">
                        {report.priority}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <InfoChip
                  icon={<ShieldAlert size={17} />}
                  label="Category"
                  value={report.category}
                />

                <InfoChip
                  icon={<Target size={17} />}
                  label="Affected Module"
                  value={report.affected_module}
                />

                <InfoChip
                  icon={<User size={17} />}
                  label="Reporter"
                  value={report.reporter.full_name}
                />

                <InfoChip
                  icon={<Clock3 size={17} />}
                  label="Priority"
                  value={
                    report.priority ??
                    "Not assigned"
                  }
                />
              </div>
            </Card>

            {/* =====================================================
                REPORT INFORMATION
            ===================================================== */}

            <Card className="p-6">
              <SectionHeader
                icon={<FileText size={18} />}
                title="Vulnerability Details"
                description="Technical information provided with this vulnerability report."
              />

              <div className="flex flex-col gap-4">
                <DetailRow label="Description">
                  {report.description}
                </DetailRow>

                <DetailRow label="Steps to Reproduce">
                  {report.steps_to_reproduce}
                </DetailRow>

                <div className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Expected Result">
                    {report.expected_result}
                  </DetailRow>

                  <DetailRow label="Actual Result">
                    {report.actual_result}
                  </DetailRow>
                </div>
              </div>

              {report.attachment_path && (
                <div className="mt-5 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-canvas)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                        <Paperclip size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--color-ink)]">
                          Report Attachment
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                          Supporting evidence attached to this report
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        downloadAttachment(
                          report.id,
                          report.attachment_path!
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      <Paperclip size={14} />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* =====================================================
                AI TRIAGE
            ===================================================== */}

            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <SectionHeader
                  icon={<Sparkles size={18} />}
                  title="AI Triage Result"
                  description="AI-assisted severity prediction and model history."
                />

                {user?.role === "admin" && (
                  <button
                    type="button"
                    onClick={handleRerunPrediction}
                    disabled={isRerunning}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        isRerunning
                          ? "animate-spin"
                          : ""
                      }
                    />

                    {isRerunning
                      ? "Running AI..."
                      : "Re-run Prediction"}
                  </button>
                )}
              </div>

              {predictionError && (
                <div className="mb-5">
                  <Alert variant="error">
                    {predictionError}
                  </Alert>
                </div>
              )}

              {isPredictionLoading ? (
                <div className="rounded-lg border border-[var(--color-border)] p-5">
                  <div className="flex items-center gap-3">
                    <RefreshCw
                      size={16}
                      className="animate-spin text-[var(--color-accent)]"
                    />

                    <p className="text-sm text-[var(--color-ink-muted)]">
                      Loading AI predictions...
                    </p>
                  </div>
                </div>
              ) : predictionHistory.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center">
                  <Sparkles
                    size={24}
                    className="mx-auto text-[var(--color-ink-faint)]"
                  />

                  <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">
                    No prediction available
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    AI triage has not been generated for this report yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">

                  {/* Latest prediction */}

                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] p-5">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                          Latest Prediction
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                          AI Security Assessment
                        </p>
                      </div>

                      <span className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 font-mono text-[11px] text-[var(--color-ink-muted)]">
                        {predictionHistory[0].model_version
                          ? `model: ${predictionHistory[0].model_version}`
                          : "model: unknown"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <SeverityBadge
                        severity={predictionHistory[0]
                            .predicted_severity as Severity}
                        confidence={
                          predictionHistory[0]
                            .confidence_score
                        }
                      />

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                          Confidence
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-[var(--color-ink)]">
                          {(
                            predictionHistory[0]
                              .confidence_score * 100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>

                    {predictionHistory[0].explanation && (
                      <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                          Explanation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
                          {predictionHistory[0].explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Prediction history */}

                  {predictionHistory.length > 1 && (
                    <div>
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                          Prediction History
                        </h4>

                        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                          Previous AI predictions for this report.
                        </p>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-[var(--color-canvas)]">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-ink-muted)]">
                                  Severity
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-ink-muted)]">
                                  Confidence
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-ink-muted)]">
                                  Model
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-ink-muted)]">
                                  Created
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {predictionHistory.map(
                                (prediction) => (
                                  <tr
                                    key={prediction.id}
                                    className="border-b last:border-b-0 hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-3">
                                      <SeverityBadge
                                        severity={prediction.predicted_severity as Severity}
                                        confidence={
                                          prediction.confidence_score
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                                      {(
                                        prediction.confidence_score *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </td>

                                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-muted)]">
                                      {prediction.model_version ||
                                        "-"}
                                    </td>

                                    <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)]">
                                      {prediction.created_at
                                        ? formatDateTime(
                                            prediction.created_at
                                          )
                                        : "-"}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* =====================================================
                DUPLICATE DETECTION
            ===================================================== */}

            <Card className="p-6">
              <SectionHeader
                icon={<Copy size={18} />}
                title="Duplicate Vulnerability Check"
                description="Identifies existing reports that may describe the same vulnerability."
              />

              {duplicateLoading && (
                <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-5">
                  <RefreshCw
                    size={16}
                    className="animate-spin text-[var(--color-accent)]"
                  />

                  <p className="text-sm text-[var(--color-ink-muted)]">
                    Checking for similar vulnerability reports...
                  </p>
                </div>
              )}

              {duplicateError && (
                <Alert variant="error">
                  {duplicateError}
                </Alert>
              )}

              {!duplicateLoading &&
                !duplicateError &&
                duplicates &&
                duplicates.duplicate_count === 0 && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-green-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          No potential duplicates found
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-600">
                          This vulnerability does not appear to closely match any existing report.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {!duplicateLoading &&
                !duplicateError &&
                duplicates &&
                duplicates.duplicate_count > 0 && (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          size={20}
                          className="mt-0.5 shrink-0 text-yellow-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-yellow-700">
                            {duplicates.duplicate_count} possible duplicate
                            {duplicates.duplicate_count !== 1
                              ? "s"
                              : ""}{" "}
                            found
                          </p>

                          <p className="mt-1 text-xs leading-5 text-yellow-600">
                            These reports have high textual similarity and should be reviewed.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {duplicates.duplicates.map(
                        (duplicate) => (
                          <Link
                            key={duplicate.report_id}
                            to={`/reports/${duplicate.report_id}`}
                            className="group rounded-xl border border-[var(--color-border)] p-4 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-canvas)]"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                                    #{duplicate.report_id}
                                  </span>

                                  <ExternalLink
                                    size={13}
                                    className="text-[var(--color-ink-faint)] transition group-hover:text-[var(--color-accent)]"
                                  />
                                </div>

                                <p className="mt-1 break-words text-sm font-semibold text-[var(--color-ink)]">
                                  {duplicate.title}
                                </p>

                                <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                                  Category:{" "}
                                  <span className="font-medium">
                                    {duplicate.category}
                                  </span>
                                </p>
                              </div>

                              <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700">
                                {Math.round(
                                  duplicate.similarity_score *
                                    100
                                )}
                                % similar
                              </span>
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
            </Card>

            {/* =====================================================
                BOTTOM ACTIONS
            ===================================================== */}

            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <Link
                to="/reports"
                className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:bg-gray-50"
              >
                <ArrowLeft size={14} />
                Back to Reports
              </Link>

              {report.attachment_path && (
                <button
                  type="button"
                  onClick={() =>
                    downloadAttachment(
                      report.id,
                      report.attachment_path!
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Paperclip size={14} />
                  Download Attachment
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}