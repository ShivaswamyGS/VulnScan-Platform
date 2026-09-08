import { useEffect, useState } from "react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  getPredictionHistory,
  rerunPrediction,
  type Prediction,
} from "../../api/predictions";

import { apiClient, getErrorMessage } from "../../api/client";

// =========================================================
// REPORT TYPE
// =========================================================

interface ReportListItem {
  id: number;
  title: string;
  category: string;
  priority: number | null;
  submission_date: string;
  status: {
    id: number;
    name: string;
  };
  latest_prediction?: Prediction | null;
}

// =========================================================
// PAGE
// =========================================================

export default function AIPredictionsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [predictions, setPredictions] = useState<
    Record<number, Prediction | null>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [rerunningId, setRerunningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // =======================================================
  // LOAD REPORTS + PREDICTIONS
  // =======================================================

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<ReportListItem[]>(
        "/reports"
      );

      const reportData = response.data;

      setReports(reportData);

      const predictionMap: Record<number, Prediction | null> = {};

      await Promise.all(
        reportData.map(async (report) => {
          try {
            const history = await getPredictionHistory(report.id);

            predictionMap[report.id] =
              history.length > 0
                ? history[history.length - 1]
                : null;
          } catch (err) {
            console.error(
              `Unable to load prediction for report ${report.id}`,
              err
            );

            predictionMap[report.id] = null;
          }
        })
      );

      setPredictions(predictionMap);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  // =======================================================
  // RERUN PREDICTION
  // =======================================================

  async function handleRerun(reportId: number) {
    try {
      setRerunningId(reportId);
      setError(null);

      const prediction = await rerunPrediction(reportId);

      setPredictions((current) => ({
        ...current,
        [reportId]: prediction,
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRerunningId(null);
    }
  }

  // =======================================================
  // SEVERITY STYLE
  // =======================================================

  function getSeverityClass(severity?: string) {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // =======================================================
  // CONFIDENCE
  // =======================================================

  function formatConfidence(value?: number) {
    if (value === undefined || value === null) {
      return "-";
    }

    return `${(value * 100).toFixed(1)}%`;
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <AppLayout title="AI Predictions">

      {error && (
        <div className="mb-5">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}

      {isLoading ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Loading AI predictions...
          </p>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="p-10 text-center">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">
            No Reports Available
          </h3>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            There are no vulnerability reports to analyze.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">

          {/* HEADER */}

          <div className="border-b p-5">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">
              AI Vulnerability Predictions
            </h2>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Review AI-generated severity predictions,
              confidence scores, and explanations.
            </p>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b bg-gray-50">

                  <th className="px-5 py-3 text-left font-medium">
                    Report
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Category
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Severity
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Confidence
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Model
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Explanation
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {reports.map((report) => {
                  const prediction =
                    predictions[report.id];

                  return (
                    <tr
                      key={report.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      {/* REPORT */}

                      <td className="px-5 py-4">

                        <p className="font-medium text-[var(--color-ink)]">
                          {report.title}
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                          Report #{report.id}
                        </p>

                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4">
                        {report.category}
                      </td>

                      {/* SEVERITY */}

                      <td className="px-5 py-4">

                        {prediction ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getSeverityClass(
                              prediction.predicted_severity
                            )}`}
                          >
                            {prediction.predicted_severity}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            Not predicted
                          </span>
                        )}

                      </td>

                      {/* CONFIDENCE */}

                      <td className="px-5 py-4">

                        {prediction
                          ? formatConfidence(
                              prediction.confidence_score
                            )
                          : "-"}

                      </td>

                      {/* MODEL */}

                      <td className="px-5 py-4">

                        {prediction?.model_version || "-"}

                      </td>

                      {/* EXPLANATION */}

                      <td className="px-5 py-4">

                        <div className="max-w-xs text-xs text-[var(--color-ink-muted)]">
                          {prediction?.explanation ||
                            "No prediction available."}
                        </div>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleRerun(report.id)
                          }
                          disabled={
                            rerunningId === report.id
                          }
                          className="rounded-md bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {rerunningId === report.id
                            ? "Running..."
                            : "Re-run AI"}
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </Card>
      )}

    </AppLayout>
  );
}