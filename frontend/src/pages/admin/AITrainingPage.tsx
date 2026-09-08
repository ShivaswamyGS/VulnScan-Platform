import { useEffect, useState } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { apiClient, getErrorMessage } from "../../api/client";

interface TrainingHistory {
  id: number;
  dataset_id: number;
  model_version: string;
  status: string;
  record_count: number;
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  model_path?: string | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export default function AITrainingPage() {
  const [history, setHistory] = useState<TrainingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get<TrainingHistory[]>(
        "/admin/training/history"
      );

      setHistory(response.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function startTraining() {
    try {
      setTraining(true);
      setError("");

      await apiClient.post<TrainingHistory>(
        "/admin/training/train"
      );

      await loadHistory();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setTraining(false);
    }
  }

  function statusClass(status: string) {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "running":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <AppLayout title="AI Model Training">
      <div className="space-y-6">

        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                Vulnerability Severity Model
              </h2>

              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Train the AI model using the currently active NVD dataset.
              </p>
            </div>

            <button
              type="button"
              onClick={startTraining}
              disabled={training}
              className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {training ? "Training..." : "Start Training"}
            </button>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Training history */}
        <Card className="overflow-hidden">

          <div className="border-b p-5">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">
              Training History
            </h2>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Previous AI model training runs and evaluation results.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-[var(--color-ink-muted)]">
                Loading training history...
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                No training runs yet
              </h3>

              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                Start training after activating a validated dataset.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-5 py-3 text-left font-medium">
                      Model
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Records
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Accuracy
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      F1 Score
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Completed
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((run) => (
                    <tr
                      key={run.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {run.model_version}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Run #{run.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            run.status
                          )}`}
                        >
                          {run.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {run.record_count}
                      </td>

                      <td className="px-5 py-4">
                        {run.accuracy !== null &&
                        run.accuracy !== undefined
                          ? `${(run.accuracy * 100).toFixed(2)}%`
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        {run.f1_score !== null &&
                        run.f1_score !== undefined
                          ? `${(run.f1_score * 100).toFixed(2)}%`
                          : "-"}
                      </td>

                      <td className="px-5 py-4 text-gray-500">
                        {run.completed_at
                          ? new Date(
                              run.completed_at
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}