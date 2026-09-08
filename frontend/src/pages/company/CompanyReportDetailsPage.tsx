import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { companyApiClient } from "../../api/companyClient";

import {
  getCompanyReport,
  updateCompanyReport,
  type CompanyReport,
} from "../../api/companyReports";

interface Status {
  id: number;
  name: string;
  description: string | null;
  is_terminal: boolean;
  sort_order: number;
}

export default function CompanyReportDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [report, setReport] = useState<CompanyReport | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const [statusId, setStatusId] = useState<number | "">("");
  const [priority, setPriority] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD REPORT + STATUSES
  // --------------------------------------------------

  useEffect(() => {
    if (!id) return;

    loadData(Number(id));
  }, [id]);

  async function loadData(reportId: number) {
    try {
      setLoading(true);
      setError("");

      // Load report
      const reportResponse = await getCompanyReport(reportId);

      setReport(reportResponse);

      // Set current status
      setStatusId(reportResponse.status.id);

      // Set current priority
      setPriority(reportResponse.priority ?? "");

      // Load statuses separately
      await loadStatuses();

    } catch (err) {
      console.error("Failed to load report page:", err);
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // LOAD STATUSES
  // --------------------------------------------------

  async function loadStatuses(): Promise<Status[]> {
    try {
      console.log("========== LOADING STATUSES ==========");

      const response = await companyApiClient.get<Status[]>("/statuses/");

      

      setStatuses(response.data);

      return response.data;
    } catch (err) {
      console.error("FAILED TO LOAD STATUSES:", err);
      throw err;
    }
  }

  // --------------------------------------------------
  // SAVE REPORT
  // --------------------------------------------------

  async function handleSave() {
    if (!report) return;

    try {
      setSaving(true);
      setError("");

      const updated = await updateCompanyReport(
        report.id,
        {
          status_id:
            statusId === ""
              ? undefined
              : Number(statusId),

          priority:
            priority === ""
              ? null
              : Number(priority),
        }
      );

      

      setReport(updated);

      // Make sure UI reflects the saved values
      setStatusId(updated.status.id);
      setPriority(updated.priority ?? "");

      alert("Report updated successfully");

    } catch (err) {
      console.error("FAILED TO UPDATE REPORT:", err);
      setError("Failed to update report");
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="p-8">
        Loading report...
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error && !report) {
    return (
      <div className="p-8">
        <div className="mb-4 text-red-600">
          {error}
        </div>

        <Link
          to="/company/reports"
          className="text-blue-600 hover:underline"
        >
          ← Back to Reports
        </Link>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  // --------------------------------------------------
  // LATEST AI PREDICTION
  // --------------------------------------------------

  const latestPrediction =
    report.predictions && report.predictions.length > 0
      ? report.predictions[0]
      : null;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="p-8">

      {/* Back */}

      <Link
        to="/company/reports"
        className="text-blue-600 hover:underline"
      >
        ← Back to Reports
      </Link>

      {/* Header */}

      <div className="mt-5 mb-6">

        <h1 className="text-3xl font-bold text-gray-900">
          {report.title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Report #{report.id.toString().padStart(4, "0")}
        </p>

      </div>

      {/* Error */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main information */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Report information */}

        <div className="rounded-lg border bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Report Information
          </h2>

          <div className="space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                Category
              </p>

              <p className="font-medium">
                {report.category}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Affected Module
              </p>

              <p className="font-medium">
                {report.affected_module}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Reporter
              </p>

              <p className="font-medium">
                {report.reporter.full_name}
              </p>

              <p className="text-sm text-gray-500">
                {report.reporter.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Employee ID
              </p>

              <p className="font-medium">
                {report.reporter.employee_id || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Submitted
              </p>

              <p className="font-medium">
                {new Date(
                  report.submission_date
                ).toLocaleString()}
              </p>
            </div>

          </div>

        </div>

        {/* Management */}

        <div className="rounded-lg border bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold">
            Report Management
          </h2>

          {/* STATUS */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              value={statusId}
              onChange={(e) => {
                const value = e.target.value;

                

                setStatusId(
                  value === ""
                    ? ""
                    : Number(value)
                );
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >

              <option value="">
                Select status
              </option>

              {statuses
                .slice()
                .sort(
                  (a, b) =>
                    a.sort_order - b.sort_order
                )
                .map((status) => (
                  <option
                    key={status.id}
                    value={status.id}
                  >
                    {status.name}
                  </option>
                ))}

            </select>

            {/* DEBUG */}

            <p className="mt-2 text-xs text-gray-500">
              Loaded statuses: {statuses.length}
            </p>

          </div>

          {/* PRIORITY */}

          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium">
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(
                  e.target.value
                    ? Number(e.target.value)
                    : ""
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >

              <option value="">
                No Priority
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

          </div>

          {/* SAVE */}

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>

      {/* Description */}

      <div className="mt-6 rounded-lg border bg-white p-6">

        <h2 className="mb-3 text-lg font-semibold">
          Description
        </h2>

        <p className="whitespace-pre-wrap text-gray-700">
          {report.description}
        </p>

      </div>

      {/* Reproduction */}

      <div className="mt-6 rounded-lg border bg-white p-6">

        <h2 className="mb-3 text-lg font-semibold">
          Steps to Reproduce
        </h2>

        <p className="whitespace-pre-wrap text-gray-700">
          {report.steps_to_reproduce}
        </p>

      </div>

      {/* Expected / Actual */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-lg border bg-white p-6">

          <h2 className="mb-3 text-lg font-semibold">
            Expected Result
          </h2>

          <p className="whitespace-pre-wrap text-gray-700">
            {report.expected_result}
          </p>

        </div>

        <div className="rounded-lg border bg-white p-6">

          <h2 className="mb-3 text-lg font-semibold">
            Actual Result
          </h2>

          <p className="whitespace-pre-wrap text-gray-700">
            {report.actual_result}
          </p>

        </div>

      </div>

      {/* AI Result */}

      <div className="mt-6 rounded-lg border bg-white p-6">

        <h2 className="mb-5 text-lg font-semibold">
          AI Triage Result
        </h2>

        {latestPrediction ? (

          <div className="space-y-3">

            <div>
              <span className="text-sm text-gray-500">
                Predicted Severity
              </span>

              <p className="mt-1 text-lg font-semibold capitalize">
                {latestPrediction.predicted_severity}
              </p>
            </div>

            <div>
              <span className="text-sm text-gray-500">
                Confidence
              </span>

              <p className="mt-1 font-medium">
                {(
                  latestPrediction.confidence_score *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>

            {latestPrediction.explanation && (
              <div>

                <span className="text-sm text-gray-500">
                  Explanation
                </span>

                <p className="mt-1 text-gray-700">
                  {latestPrediction.explanation}
                </p>

              </div>
            )}

          </div>

        ) : (

          <p className="text-sm text-gray-500">
            No AI prediction available.
          </p>

        )}

      </div>

    </div>
  );
}