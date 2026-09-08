import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Save,
  RefreshCw,
} from "lucide-react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { SeverityBadge } from "../../components/ui/SeverityBadge";
import { StatusBadge } from "../../components/ui/StatusBadge";

import {
  getReports,
  getStatuses,
  updateReport,
} from "../../api/reports";

import { getErrorMessage } from "../../api/client";

import type {
  ReportListItem,
  Status,
} from "../../types";


function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}


export function AdminReportsPage() {
  const [reports, setReports] =
    useState<ReportListItem[]>([]);

  const [statuses, setStatuses] =
    useState<Status[]>([]);

  const [search, setSearch] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [savingId, setSavingId] =
    useState<number | null>(null);

  const [priorities, setPriorities] =
    useState<Record<number, string>>({});

  const [selectedStatuses, setSelectedStatuses] =
    useState<Record<number, string>>({});


  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      const [reportsData, statusesData] =
        await Promise.all([
          getReports(),
          getStatuses(),
        ]);

      setReports(reportsData);

      setStatuses(
        statusesData
          .slice()
          .sort(
            (a, b) =>
              a.sort_order - b.sort_order
          )
      );

      const priorityValues: Record<
        number,
        string
      > = {};

      const statusValues: Record<
        number,
        string
      > = {};

      reportsData.forEach((report) => {
        priorityValues[report.id] =
          report.priority?.toString() ?? "";

        statusValues[report.id] =
          report.status.id.toString();
      });

      setPriorities(priorityValues);
      setSelectedStatuses(statusValues);

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
    loadData();
  }, []);


  async function handleSave(
    reportId: number
  ) {
    try {
      setSavingId(reportId);
      setError(null);

      const priorityValue =
        priorities[reportId];

      const statusValue =
        selectedStatuses[reportId];

      const updated =
        await updateReport(
          reportId,
          {
            status_id: statusValue
              ? Number(statusValue)
              : undefined,

            priority:
              priorityValue === ""
                ? null
                : Number(priorityValue),
          }
        );

      setReports((current) =>
        current.map((report) =>
          report.id === reportId
            ? {
                ...report,
                priority:
                  updated.priority,
                status:
                  updated.status,
              }
            : report
        )
      );

      setSelectedStatuses((current) => ({
        ...current,
        [reportId]:
          updated.status.id.toString(),
      }));

      setPriorities((current) => ({
        ...current,
        [reportId]:
          updated.priority?.toString() ?? "",
      }));

    } catch (err) {
      console.error(err);

      setError(
        getErrorMessage(err)
      );
    } finally {
      setSavingId(null);
    }
  }


  const filteredReports =
    reports.filter((report) =>
      report.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  return (
    <AppLayout title="Report Management">

      <div className="mx-auto max-w-7xl space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-lg font-semibold text-[var(--color-ink)]">
              Report Management
            </h1>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Review vulnerability reports and manage their status and priority.
            </p>
          </div>


          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border-strong)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                isLoading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>


        {/* Search */}
        <div className="flex items-center justify-between gap-4">

          <div className="relative w-72">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search reports..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white py-2 pl-9 pr-3 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />

          </div>

          <div className="text-xs text-[var(--color-ink-muted)]">
            {filteredReports.length} report
            {filteredReports.length === 1
              ? ""
              : "s"}
          </div>

        </div>


        {/* Error */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}


        {/* Main card */}
        <Card className="overflow-hidden">

          {isLoading ? (

            <div className="p-10 text-center text-sm text-[var(--color-ink-muted)]">
              Loading reports...
            </div>

          ) : filteredReports.length === 0 ? (

            <div className="p-12 text-center text-sm text-[var(--color-ink-muted)]">
              No reports found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">

                    <th className="px-5 py-3 font-medium">
                      Report
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Category
                    </th>

                    <th className="px-5 py-3 font-medium">
                      AI Severity
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Priority
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Submitted
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Actions
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {filteredReports.map(
                    (report) => {

                      const prediction =
                        report.latest_prediction;

                      const isSaving =
                        savingId === report.id;


                      return (
                        <tr
                          key={report.id}
                          className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-canvas)]"
                        >

                          {/* Report */}
                          <td className="px-5 py-4">

                            <Link
                              to={`/reports/${report.id}`}
                              className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                            >
                              {report.title}
                            </Link>

                            <div className="mt-0.5 font-mono text-xs text-[var(--color-ink-faint)]">
                              #
                              {report.id
                                .toString()
                                .padStart(
                                  4,
                                  "0"
                                )}
                            </div>

                          </td>


                          {/* Category */}
                          <td className="px-5 py-4 text-[var(--color-ink-muted)]">
                            {report.category}
                          </td>


                          {/* AI Severity */}
                          <td className="px-5 py-4">

                            {prediction ? (

                              <SeverityBadge
                                severity={
                                  prediction.predicted_severity
                                }
                                confidence={
                                  prediction.confidence_score
                                }
                                size="sm"
                              />

                            ) : (

                              <span className="text-xs text-[var(--color-ink-faint)]">
                                Pending
                              </span>

                            )}

                          </td>


                          {/* Status */}
                          <td className="px-5 py-4">

                            <div className="space-y-2">

                              <select
                                value={
                                  selectedStatuses[
                                    report.id
                                  ] ?? ""
                                }
                                onChange={(e) =>
                                  setSelectedStatuses(
                                    (current) => ({
                                      ...current,
                                      [report.id]:
                                        e.target.value,
                                    })
                                  )
                                }
                                className="w-40 rounded border border-[var(--color-border-strong)] bg-white px-2 py-1.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
                                disabled={isSaving}
                              >

                                {statuses.length ===
                                0 ? (

                                  <option value="">
                                    No statuses available
                                  </option>

                                ) : (

                                  statuses.map(
                                    (status) => (
                                      <option
                                        key={
                                          status.id
                                        }
                                        value={
                                          status.id
                                        }
                                      >
                                        {status.name}
                                      </option>
                                    )
                                  )

                                )}

                              </select>


                              <div>
                                <StatusBadge
                                  name={
                                    report.status.name
                                  }
                                  isTerminal={
                                    report.status
                                      .is_terminal
                                  }
                                />
                              </div>

                            </div>

                          </td>


                          {/* Priority */}
                          <td className="px-5 py-4">

                            <select
                              value={
                                priorities[
                                  report.id
                                ] ?? ""
                              }
                              onChange={(e) =>
                                setPriorities(
                                  (current) => ({
                                    ...current,
                                    [report.id]:
                                      e.target.value,
                                  })
                                )
                              }
                              className="w-32 rounded border border-[var(--color-border-strong)] bg-white px-2 py-1.5 text-xs focus:border-[var(--color-accent)] focus:outline-none"
                              disabled={isSaving}
                            >

                              <option value="">
                                None
                              </option>

                              <option value="1">
                                1 - Highest
                              </option>

                              <option value="2">
                                2 - High
                              </option>

                              <option value="3">
                                3 - Medium
                              </option>

                              <option value="4">
                                4 - Low
                              </option>

                              <option value="5">
                                5 - Lowest
                              </option>

                            </select>

                          </td>


                          {/* Submitted */}
                          <td className="px-5 py-4 font-mono text-xs text-[var(--color-ink-muted)]">
                            {formatDate(
                              report.submission_date
                            )}
                          </td>


                          {/* Actions */}
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <Button
                                onClick={() =>
                                  handleSave(
                                    report.id
                                  )
                                }
                                disabled={
                                  isSaving
                                }
                              >

                                <Save size={14} />

                                {isSaving
                                  ? "Saving..."
                                  : "Save"}

                              </Button>


                              <Link
                                to={`/reports/${report.id}`}
                                className="inline-flex items-center gap-1.5 rounded border border-[var(--color-border-strong)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
                              >
                                <Eye size={14} />
                                View
                              </Link>

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

        </Card>

      </div>

    </AppLayout>
  );
}