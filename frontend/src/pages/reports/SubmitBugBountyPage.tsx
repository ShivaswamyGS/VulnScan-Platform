import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  createSubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function SubmitBugBountyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [vulnerabilityType, setVulnerabilityType] = useState("");
  const [affectedAsset, setAffectedAsset] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [proofOfConcept, setProofOfConcept] = useState("");
  const [impact, setImpact] = useState("");
  const [remediation, setRemediation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError("Program ID is missing");
      return;
    }

    if (title.trim().length < 5) {
      setError(
        "Vulnerability title must be at least 5 characters"
      );
      return;
    }

    if (description.trim().length < 20) {
      setError(
        "Vulnerability description must be at least 20 characters"
      );
      return;
    }

    if (vulnerabilityType.trim().length < 2) {
      setError("Vulnerability type is required");
      return;
    }

    if (affectedAsset.trim().length < 2) {
      setError("Affected asset is required");
      return;
    }

    if (stepsToReproduce.trim().length < 10) {
      setError(
        "Steps to reproduce must be at least 10 characters"
      );
      return;
    }

    if (impact.trim().length < 10) {
      setError(
        "Impact description must be at least 10 characters"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createSubmission(Number(id), {
        title: title.trim(),
        description: description.trim(),
        vulnerability_type:
          vulnerabilityType.trim(),
        affected_asset:
          affectedAsset.trim(),
        steps_to_reproduce:
          stepsToReproduce.trim(),
        proof_of_concept:
          proofOfConcept.trim() || null,
        impact: impact.trim(),
        remediation:
          remediation.trim() || null,
        attachment_path: null,
      });

      navigate("/reports");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Submit Vulnerability">

      <Card className="max-w-4xl p-6">

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Submit Vulnerability
          </h2>

          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Provide detailed information about the
            vulnerability discovered in this Bug Bounty Program.
          </p>
        </div>

        {error && (
          <div className="mb-5">
            <Alert variant="error">
              {error}
            </Alert>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* TITLE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Example: SQL Injection in login endpoint"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* VULNERABILITY TYPE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Type *
            </label>

            <input
              type="text"
              value={vulnerabilityType}
              onChange={(event) =>
                setVulnerabilityType(event.target.value)
              }
              placeholder="Example: SQL Injection"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* AFFECTED ASSET */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Affected Asset *
            </label>

            <input
              type="text"
              value={affectedAsset}
              onChange={(event) =>
                setAffectedAsset(event.target.value)
              }
              placeholder="Example: https://example.com/login"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Description *
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the vulnerability in detail..."
              rows={7}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* STEPS */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Steps to Reproduce *
            </label>

            <textarea
              value={stepsToReproduce}
              onChange={(event) =>
                setStepsToReproduce(event.target.value)
              }
              placeholder={`1. Open the affected endpoint
2. Enter the required input
3. Send the request
4. Observe the vulnerability`}
              rows={8}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* POC */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Proof of Concept
            </label>

            <textarea
              value={proofOfConcept}
              onChange={(event) =>
                setProofOfConcept(event.target.value)
              }
              placeholder="Provide safe proof-of-concept details, request examples, screenshots references, etc."
              rows={7}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* IMPACT */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Impact *
            </label>

            <textarea
              value={impact}
              onChange={(event) =>
                setImpact(event.target.value)
              }
              placeholder="Explain the security impact of this vulnerability..."
              rows={5}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* REMEDIATION */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Suggested Remediation
            </label>

            <textarea
              value={remediation}
              onChange={(event) =>
                setRemediation(event.target.value)
              }
              placeholder="Provide recommendations for fixing the vulnerability..."
              rows={5}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 pt-2">

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Vulnerability"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate(-1)}
              className="rounded-lg border px-5 py-3 text-sm font-medium"
            >
              Cancel
            </button>

          </div>

        </form>
      </Card>
    </AppLayout>
  );
}