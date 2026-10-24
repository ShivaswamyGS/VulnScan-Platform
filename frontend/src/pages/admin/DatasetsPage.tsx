import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { apiClient, getErrorMessage } from "../../api/client";

interface Dataset {
  id: number;
  name: string;
  file_path: string;
  dataset_type: string;
  record_count: number;
  validation_status: string;
  validation_message: string | null;
  is_active: boolean;
  uploaded_at: string;
  updated_at: string;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<Dataset[]>(
        "/admin/datasets"
      );

      setDatasets(response.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV dataset file.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("file", file);

      await apiClient.post(
        "/admin/datasets/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(
        "Dataset uploaded and registered successfully."
      );

      await loadDatasets();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleActivate(datasetId: number) {
    try {
      setActivatingId(datasetId);
      setError(null);
      setSuccess(null);

      await apiClient.post(
        `/admin/datasets/${datasetId}/activate`
      );

      setSuccess("Dataset activated successfully.");

      await loadDatasets();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setActivatingId(null);
    }
  }

  function getValidationClass(status: string) {
    switch (status?.toLowerCase()) {
      case "valid":
      case "validated":
        return "bg-green-100 text-green-700";

      case "invalid":
      case "failed":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <AppLayout title="AI Training Datasets">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">
            AI Training Datasets
          </h1>

          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Upload, validate, and manage vulnerability datasets
            used for AI model training.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {success && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Upload */}
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-ink)]">
                Upload Dataset
              </h2>

              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Upload an NVD vulnerability dataset in CSV format.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90">
              {isUploading
                ? "Uploading..."
                : "Upload CSV"}

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </Card>

        {/* Dataset list */}
        {isLoading ? (
          <Card className="p-10 text-center">
            <p className="text-sm text-[var(--color-ink-muted)]">
              Loading datasets...
            </p>
          </Card>
        ) : datasets.length === 0 ? (
          <Card className="p-10 text-center">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              No datasets registered
            </h3>

            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Upload an NVD CSV dataset to begin AI training.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">

            <div className="border-b p-5">
              <h2 className="text-base font-semibold text-[var(--color-ink)]">
                Registered Datasets
              </h2>

              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Review dataset validation and activation status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">

                <thead>
                  <tr className="border-b bg-gray-50">

                    <th className="px-5 py-3 text-left font-medium">
                      Dataset
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Records
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Validation
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Uploaded
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {datasets.map((dataset) => (
                    <tr
                      key={dataset.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">
                        <p className="font-medium text-[var(--color-ink)]">
                          {dataset.name}
                        </p>

                        {dataset.validation_message && (
                          <p className="mt-1 max-w-xs text-xs text-[var(--color-ink-muted)]">
                            {dataset.validation_message}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {dataset.dataset_type}
                      </td>

                      <td className="px-5 py-4">
                        {dataset.record_count.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getValidationClass(
                            dataset.validation_status
                          )}`}
                        >
                          {dataset.validation_status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {dataset.is_active ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-500">
                        {new Date(
                          dataset.uploaded_at
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        {dataset.is_active ? (
                          <span className="text-xs font-medium text-green-600">
                            Currently Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleActivate(dataset.id)
                            }
                            disabled={
                              activatingId === dataset.id ||
                              dataset.validation_status.toLowerCase() !==
                                "validated"
                            }
                            className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {activatingId === dataset.id
                              ? "Activating..."
                              : "Activate"}
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </Card>
        )}

      </div>
    </AppLayout>
  );
}