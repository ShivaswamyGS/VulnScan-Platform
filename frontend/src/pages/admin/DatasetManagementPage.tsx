import { ChangeEvent, useEffect, useState } from "react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  activateDataset,
  getDatasets,
  type TrainingDataset,
  uploadDataset,
} from "../../api/datasets";

import { getErrorMessage } from "../../api/client";

export default function DatasetManagementPage() {
  const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getDatasets();

      setDatasets(data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setError(null);
    setSuccess(null);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a dataset file.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV dataset.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      await uploadDataset(selectedFile);

      setSelectedFile(null);

      setSuccess(
        "Dataset uploaded and registered successfully."
      );

      await loadDatasets();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleActivate(datasetId: number) {
    try {
      setActivatingId(datasetId);
      setError(null);
      setSuccess(null);

      await activateDataset(datasetId);

      setSuccess(
        "Dataset activated successfully."
      );

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
      {/* Messages */}

      {error && (
        <div className="mb-5">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Upload */}

      <Card className="mb-6 p-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-ink)]">
            Upload Training Dataset
          </h2>

          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Upload an NVD vulnerability dataset in CSV format.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label
              htmlFor="dataset-file"
              className="mb-2 block text-sm font-medium"
            >
              Dataset CSV
            </label>

            <input
              id="dataset-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full rounded-md border px-3 py-2 text-sm"
            />

            {selectedFile && (
              <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading
              ? "Uploading..."
              : "Upload Dataset"}
          </button>
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
            No Training Datasets
          </h3>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Upload a validated vulnerability dataset to
            prepare it for AI model training.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b p-5">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">
              Registered Datasets
            </h2>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Manage datasets available for AI training.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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

                      <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        #{dataset.id}
                      </p>
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

                      {dataset.validation_message && (
                        <p className="mt-2 max-w-xs text-xs text-gray-500">
                          {dataset.validation_message}
                        </p>
                      )}
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

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-ink-muted)]">
                      {new Date(
                        dataset.uploaded_at
                      ).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      {!dataset.is_active && (
                        <button
                          type="button"
                          onClick={() =>
                            handleActivate(dataset.id)
                          }
                          disabled={
                            activatingId === dataset.id ||
                            ![
                              "valid",
                              "validated",
                            ].includes(
                              dataset.validation_status.toLowerCase()
                            )
                          }
                          className="rounded-md bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {activatingId === dataset.id
                            ? "Activating..."
                            : "Activate"}
                        </button>
                      )}

                      {dataset.is_active && (
                        <span className="text-xs text-green-700">
                          Currently active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}