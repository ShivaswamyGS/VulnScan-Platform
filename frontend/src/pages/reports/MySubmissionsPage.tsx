import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  getMySubmissions,
  type VulnerabilitySubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<
    VulnerabilitySubmission[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getMySubmissions();

      setSubmissions(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700";

      case "resolved":
        return "bg-blue-100 text-blue-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "triaged":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getSeverityClass(severity?: string | null) {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";

      case "high":
        return "bg-orange-100 text-orange-800";

      case "medium":
        return "bg-yellow-100 text-yellow-800";

      case "low":
        return "bg-green-100 text-green-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <AppLayout title="My Vulnerability Submissions">
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
            Loading submissions...
          </p>
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="p-10 text-center">
          <h3 className="text-base font-semibold text-[var(--color-ink)]">
            No submissions yet
          </h3>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            You have not submitted any vulnerabilities yet.
          </p>

          <div className="mt-5">
            <Link
              to="/programs"
              className="inline-flex rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
            >
              Browse Bug Bounty Programs
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-5 py-4 text-left font-semibold">
                    Title
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Program
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Severity
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Bounty
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-ink)]">
                        {submission.title}
                      </p>

                      <p className="mt-1 max-w-xs truncate text-xs text-[var(--color-ink-muted)]">
                        {submission.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      #{submission.program_id}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          submission.status
                        )}`}
                      >
                        {submission.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {submission.severity ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getSeverityClass(
                            submission.severity
                          )}`}
                        >
                          {submission.severity}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {submission.bounty_amount !== null &&
                      submission.bounty_amount !== undefined
                        ? submission.bounty_amount
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/reports/${submission.id}`}
                        className="text-[var(--color-accent)] hover:underline"
                      >
                        View
                      </Link>
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