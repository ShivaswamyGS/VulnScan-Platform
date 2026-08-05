import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, X } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { FieldWrapper, TextArea, TextInput } from "../../components/ui/FormField";
import { Select } from "../../components/ui/Select";
import { VULNERABILITY_CATEGORIES } from "../../constants/categories";
import { submitReport } from "../../api/reports";
import { getErrorMessage } from "../../api/client";
import type { ReportCreateInput } from "../../types";

const EMPTY_FORM: Omit<ReportCreateInput, "attachment"> = {
  title: "",
  description: "",
  affected_module: "",
  category: "",
  steps_to_reproduce: "",
  expected_result: "",
  actual_result: "",
};

const MAX_ATTACHMENT_MB = 10;

export function SubmitReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      setError(`Attachment must be smaller than ${MAX_ATTACHMENT_MB}MB.`);
      e.target.value = "";
      return;
    }
    setError(null);
    setAttachment(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const report = await submitReport({ ...form, attachment });
      navigate(`/reports/${report.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Submit Vulnerability Report">
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 text-sm text-[var(--color-ink-muted)]">
          Submit a detailed report and the AI triage model will estimate its severity automatically.
          An administrator will review and confirm the final priority.
        </p>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && <Alert variant="error">{error}</Alert>}

            <FieldWrapper label="Title" htmlFor="title" hint="A short, specific summary of the issue.">
              <TextInput
                id="title"
                required
                minLength={5}
                maxLength={200}
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="SQL injection in the login endpoint"
              />
            </FieldWrapper>

            <div className="grid grid-cols-2 gap-4">
              <FieldWrapper label="Affected module" htmlFor="affected_module">
                <TextInput
                  id="affected_module"
                  required
                  value={form.affected_module}
                  onChange={(e) => updateField("affected_module", e.target.value)}
                  placeholder="Auth Service"
                />
              </FieldWrapper>

              <FieldWrapper label="Category" htmlFor="category">
                <Select
                  id="category"
                  required
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {VULNERABILITY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </FieldWrapper>
            </div>

            <FieldWrapper
              label="Description"
              htmlFor="description"
              hint="Be specific — this is what the AI model reads to estimate severity."
            >
              <TextArea
                id="description"
                required
                minLength={10}
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the vulnerability and its potential impact..."
              />
            </FieldWrapper>

            <FieldWrapper label="Steps to reproduce" htmlFor="steps">
              <TextArea
                id="steps"
                required
                rows={3}
                value={form.steps_to_reproduce}
                onChange={(e) => updateField("steps_to_reproduce", e.target.value)}
                placeholder="1. Navigate to /login&#10;2. Submit email as ' OR '1'='1"
              />
            </FieldWrapper>

            <div className="grid grid-cols-2 gap-4">
              <FieldWrapper label="Expected result" htmlFor="expected_result">
                <TextArea
                  id="expected_result"
                  required
                  rows={2}
                  value={form.expected_result}
                  onChange={(e) => updateField("expected_result", e.target.value)}
                  placeholder="Login is rejected"
                />
              </FieldWrapper>

              <FieldWrapper label="Actual result" htmlFor="actual_result">
                <TextArea
                  id="actual_result"
                  required
                  rows={2}
                  value={form.actual_result}
                  onChange={(e) => updateField("actual_result", e.target.value)}
                  placeholder="Login succeeds, bypassing auth"
                />
              </FieldWrapper>
            </div>

            <FieldWrapper label="Attachment (optional)" htmlFor="attachment" hint="Screenshots or logs, up to 10MB.">
              {attachment ? (
                <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-[var(--color-ink)]">
                    <Paperclip size={14} />
                    {attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-danger)]"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <input
                  id="attachment"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf,.txt,.log,.zip"
                  onChange={handleFileChange}
                  className="w-full rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-3 py-2 text-sm text-[var(--color-ink-muted)] file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[var(--color-accent-soft)] file:px-3 file:py-1 file:text-[var(--color-accent)]"
                />
              )}
            </FieldWrapper>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate("/reports")}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Submit report
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
