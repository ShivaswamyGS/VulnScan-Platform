import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip, Sparkles } from "lucide-react";

import CompanyProtectedRoute from "../../components/CompanyProtectedRoute";
import {
  getCompanyReport,
  type CompanyReport,
} from "../../api/companyReports";

export default function CompanyReportDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [report, setReport] = useState<CompanyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    loadReport(Number(id));
  }, [id]);

  async function loadReport(reportId: number) {
    try {
      setLoading(true);
      setError("");

      const data = await getCompanyReport(reportId);

      setReport(data);
    } catch (err) {
      console.error("Failed to load report:", err);
      setError("Failed to load report details");
    } finally {
      setLoading(false);
    }
  }

  function getSeverity() {
    if (!report?.predictions || report.predictions.length === 0) {
      return null;
    }

    return report.predictions[0];
  }

  function severityClass(severity: string) {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  if (loading) {
    return (
      <CompanyProtectedRoute>
        <div className="p-8">
          <div className="rounded-lg border bg-white p-10 text-center text-gray-500">
            Loading report...
          </div>
        </div>
      </CompanyProtectedRoute>
    );
  }

  if (error || !report) {
    return (
      <CompanyProtectedRoute>
        <div className="p-8">
          <Link
            to="/company/reports"
            className="mb-5 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Reports
          </Link>

          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            {error || "Report not found"}
          </div>
        </div>
      </CompanyProtectedRoute>
    );
  }

  const prediction = getSeverity();

  return (
    <CompanyProtectedRoute>
      <div className="p-8">

        {/* Back */}
        <Link
          to="/company/reports"
          className="mb-5 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Reports
        </Link>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {report.title}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Report #{report.id.toString().padStart(4, "0")}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              report.status.is_terminal
                ? "bg-gray-100 text-gray-600"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {report.status.name}
          </span>
        </div>

        {/* Main report information */}
        <div className="mb-6 rounded-lg border bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Vulnerability Information
          </h2>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Affected Module
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {report.affected_module}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Category
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {report.category}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Priority
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {report.priority ?? "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Submitted
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {new Date(
                  report.submission_date
                ).toLocaleString()}
              </p>
            </div>

          </div>
        </div>

        {/* Reporter */}
        <div className="mb-6 rounded-lg border bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Reporter Information
          </h2>

          <div className="grid grid-cols-2 gap-6">

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Name
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {report.reporter.full_name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Email
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {report.reporter.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Department
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {report.reporter.department || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Designation
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {report.reporter.designation || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Employee ID
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {report.reporter.employee_id || "Not specified"}
              </p>
            </div>

          </div>
        </div>

        {/* Description */}
        <div className="mb-6 rounded-lg border bg-white p-6">

          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Description
          </h2>

          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {report.description}
          </p>

        </div>

        {/* Reproduction */}
        <div className="mb-6 rounded-lg border bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Reproduction Details
          </h2>

          <div className="space-y-5">

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Steps to Reproduce
              </h3>

              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {report.steps_to_reproduce}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  Expected Result
                </h3>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {report.expected_result}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  Actual Result
                </h3>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {report.actual_result}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* AI Triage */}
        <div className="mb-6 rounded-lg border bg-white p-6">

          <div className="mb-5 flex items-center gap-2">

            <Sparkles
              size={18}
              className="text-blue-600"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              AI Triage Result
            </h2>

          </div>

          {!prediction ? (

            <div className="rounded-lg bg-gray-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                AI prediction is not available for this report yet.
              </p>
            </div>

          ) : (

            <div className="space-y-5">

              {/* Severity */}
              <div className="flex items-center gap-4">

                <span className="text-sm font-medium text-gray-700">
                  Predicted Severity:
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${severityClass(
                    prediction.predicted_severity
                  )}`}
                >
                  {prediction.predicted_severity}
                </span>

              </div>

              {/* Confidence */}
              <div>

                <div className="mb-2 flex justify-between">

                  <span className="text-sm font-medium text-gray-700">
                    Confidence
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {(prediction.confidence_score * 100).toFixed(2)}%
                  </span>

                </div>

                <div className="h-2 w-full rounded-full bg-gray-200">

                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        prediction.confidence_score * 100,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* Explanation */}
              {prediction.explanation && (

                <div>

                  <h3 className="mb-2 text-sm font-semibold text-gray-800">
                    AI Explanation
                  </h3>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {prediction.explanation}
                  </p>

                </div>

              )}

              {/* Model */}
              <div className="grid grid-cols-2 gap-6">

                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Model Version
                  </p>

                  <p className="mt-1 font-mono text-sm text-gray-900">
                    {prediction.model_version}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Prediction Time
                  </p>

                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(
                      prediction.created_at
                    ).toLocaleString()}
                  </p>
                </div>

              </div>

            </div>

          )}

        </div>

        {/* Attachment */}
        {report.attachment_path && (

          <div className="rounded-lg border bg-white p-6">

            <div className="flex items-center gap-3">

              <Paperclip
                size={18}
                className="text-gray-500"
              />

              <div>

                <h2 className="text-sm font-semibold text-gray-900">
                  Attachment
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {report.attachment_path}
                </p>

              </div>

            </div>

          </div>

        )}

      </div>
    </CompanyProtectedRoute>
  );
}