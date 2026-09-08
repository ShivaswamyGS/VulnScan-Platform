import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import CompanyLayout from "../../components/company/CompanyLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  getCompanySubmissionById,
  updateCompanySubmission,
  type VulnerabilitySubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function CompanySubmissionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [submission, setSubmission] =
    useState<VulnerabilitySubmission | null>(null);

  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [bountyAmount, setBountyAmount] = useState("");
  const [reviewerComment, setReviewerComment] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Submission ID is missing.");
      setIsLoading(false);
      return;
    }

    loadSubmission(Number(id));
  }, [id]);

  async function loadSubmission(submissionId: number) {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getCompanySubmissionById(submissionId);

      setSubmission(data);
      setStatus(data.status || "");
      setSeverity(data.severity || "");

      setBountyAmount(
        data.bounty_amount !== null &&
          data.bounty_amount !== undefined
          ? String(data.bounty_amount)
          : ""
      );

      setReviewerComment(data.reviewer_comment || "");
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!submission) {
      return;
    }

    setError(null);
    setSuccess(null);

    if (!status.trim()) {
      setError("Please select a submission status.");
      return;
    }

    if (!severity.trim()) {
      setError("Please select a severity.");
      return;
    }

    if (
      bountyAmount.trim() !== "" &&
      (Number.isNaN(Number(bountyAmount)) ||
        Number(bountyAmount) < 0)
    ) {
      setError("Please enter a valid bounty amount.");
      return;
    }

    try {
      setIsSaving(true);

      const updated = await updateCompanySubmission(
        submission.id,
        {
          status: status.trim(),
          severity: severity.trim(),
          bounty_amount:
            bountyAmount.trim() === ""
              ? null
              : Number(bountyAmount),
          reviewer_comment:
            reviewerComment.trim() || null,
        }
      );

      setSubmission(updated);

      setStatus(updated.status || "");
      setSeverity(updated.severity || "");

      setBountyAmount(
        updated.bounty_amount !== null &&
          updated.bounty_amount !== undefined
          ? String(updated.bounty_amount)
          : ""
      );

      setReviewerComment(
        updated.reviewer_comment || ""
      );

      setSuccess(
        "Review saved successfully. The researcher has been notified."
      );
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  function getStatusClass(statusValue?: string) {
    switch (statusValue?.toLowerCase()) {
      case "accepted":
      case "resolved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "triaged":
      case "in_review":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getSeverityClass(severityValue?: string | null) {
    switch (severityValue?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-blue-100 text-blue-700";

      case "informational":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-500";
    }
  }

  if (isLoading) {
    return (
      <CompanyLayout title="Review Vulnerability">
        <Card className="p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-accent)]" />

          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            Loading vulnerability submission...
          </p>
        </Card>
      </CompanyLayout>
    );
  }

  if (!submission) {
    return (
      <CompanyLayout title="Review Vulnerability">
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
            !
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            Submission not found
          </h2>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            The vulnerability submission could not be loaded.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/company/submissions")
            }
            className="mt-5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back to Submissions
          </button>
        </Card>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout title="Review Vulnerability">
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Link
              to="/company/submissions"
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              ← Back to Submissions
            </Link>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
              Submission #{submission.id}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--color-ink)]">
              {submission.title}
            </h1>

            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Program #{submission.program_id}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClass(
                submission.status
              )}`}
            >
              {submission.status || "Pending"}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${getSeverityClass(
                submission.severity
              )}`}
            >
              {submission.severity || "Not assessed"}
            </span>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        {/* MAIN CONTENT */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* VULNERABILITY DETAILS */}
          <div className="space-y-6 lg:col-span-2">

            <Card className="p-6">
              <div className="mb-6 border-b pb-5">
                <h2 className="text-lg font-semibold">
                  Vulnerability Information
                </h2>

                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  Complete information provided by the researcher.
                </p>
              </div>

              <div className="space-y-7">

                {/* TYPE */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Vulnerability Type
                  </h3>

                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {submission.vulnerability_type ||
                      "Not provided"}
                  </p>
                </div>

                {/* ASSET */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Affected Asset
                  </h3>

                  <p className="break-all text-sm text-[var(--color-ink-muted)]">
                    {submission.affected_asset ||
                      "Not provided"}
                  </p>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Description
                  </h3>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-ink-muted)]">
                      {submission.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                {/* STEPS */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Steps to Reproduce
                  </h3>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-ink-muted)]">
                      {submission.steps_to_reproduce ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                {/* POC */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Proof of Concept
                  </h3>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-ink-muted)]">
                      {submission.proof_of_concept ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                {/* IMPACT */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Security Impact
                  </h3>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-ink-muted)]">
                      {submission.impact ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                {/* REMEDIATION */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Suggested Remediation
                  </h3>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-ink-muted)]">
                      {submission.remediation ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                {/* ATTACHMENT */}
                {submission.attachment_path && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold">
                      Attachment
                    </h3>

                    <p className="break-all rounded-lg bg-gray-50 p-4 text-sm text-[var(--color-ink-muted)]">
                      {submission.attachment_path}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* CURRENT REVIEW */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold">
                Current Review
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">

                <div className="rounded-lg border p-4">
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    Status
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {submission.status || "Pending"}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    Severity
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {submission.severity ||
                      "Not assessed"}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    Bounty
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {submission.bounty_amount !== null &&
                    submission.bounty_amount !== undefined
                      ? `₹${Number(
                          submission.bounty_amount
                        ).toLocaleString("en-IN")}`
                      : "Not assigned"}
                  </p>
                </div>
              </div>

              {submission.reviewer_comment && (
                <div className="mt-5">
                  <p className="text-xs font-medium text-[var(--color-ink-muted)]">
                    Reviewer Comment
                  </p>

                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6">
                    {submission.reviewer_comment}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* REVIEW PANEL */}
          <Card className="h-fit p-6 lg:sticky lg:top-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Review Submission
              </h2>

              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Assess the vulnerability and update its review status.
              </p>
            </div>

            <form
              onSubmit={handleUpdate}
              className="space-y-5"
            >

              {/* STATUS */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  disabled={isSaving}
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="">
                    Select status
                  </option>

                  <option value="triaged">
                    Triaged
                  </option>

                  <option value="accepted">
                    Accepted
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>
              </div>

              {/* SEVERITY */}
              <div>
                <label
                  htmlFor="severity"
                  className="mb-2 block text-sm font-medium"
                >
                  Severity
                </label>

                <select
                  id="severity"
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value)
                  }
                  disabled={isSaving}
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="">
                    Select severity
                  </option>

                  <option value="critical">
                    Critical
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="low">
                    Low
                  </option>

                  <option value="informational">
                    Informational
                  </option>
                </select>
              </div>

              {/* BOUNTY */}
              <div>
                <label
                  htmlFor="bounty"
                  className="mb-2 block text-sm font-medium"
                >
                  Bounty Amount (₹)
                </label>

                <input
                  id="bounty"
                  type="number"
                  min="0"
                  step="0.01"
                  value={bountyAmount}
                  onChange={(event) =>
                    setBountyAmount(event.target.value)
                  }
                  placeholder="Example: 5000"
                  disabled={isSaving}
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {/* COMMENT */}
              <div>
                <label
                  htmlFor="reviewerComment"
                  className="mb-2 block text-sm font-medium"
                >
                  Reviewer Comment
                </label>

                <textarea
                  id="reviewerComment"
                  value={reviewerComment}
                  onChange={(event) =>
                    setReviewerComment(
                      event.target.value
                    )
                  }
                  placeholder="Explain your decision or provide feedback to the researcher..."
                  rows={7}
                  disabled={isSaving}
                  className="w-full resize-y rounded-lg border px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {/* SAVE */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving Review..."
                  : "Save Review"}
              </button>

              <Link
                to="/company/submissions"
                className="block w-full rounded-lg border px-5 py-3 text-center text-sm font-medium transition hover:bg-gray-50"
              >
                Cancel
              </Link>
            </form>
          </Card>
        </div>
      </div>
    </CompanyLayout>
  );
}