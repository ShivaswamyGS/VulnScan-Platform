import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Plus, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CompanyLayout from "../../components/company/CompanyLayout";
import { createProgram } from "../../api/programs";
import { getErrorMessage } from "../../api/client";

export default function CreateProgramPage() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    program_name: "",
    description: "",
    target_website: "",
    scope: "",
    out_of_scope: "",
    reward_min: "",
    reward_max: "",
    severity_reward_matrix: "",
    program_rules: "",
    submission_guidelines: "",
    start_date: "",
    end_date: "",
    status: "draft",
    visibility: "private",
    attachments: "",
    is_active: true,
  });

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      if (form.reward_min && form.reward_max) {
        if (
          Number(form.reward_min) >
          Number(form.reward_max)
        ) {
          setError(
            "Minimum reward cannot be greater than maximum reward."
          );
          setIsSubmitting(false);
          return;
        }
      }

      if (!form.start_date) {
        setError("Please select a start date.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        program_name: form.program_name.trim(),
        description: form.description.trim(),
        target_website: form.target_website.trim(),
        scope: form.scope.trim(),
        out_of_scope:
          form.out_of_scope.trim() || null,
        reward_min:
          form.reward_min === ""
            ? null
            : Number(form.reward_min),
        reward_max:
          form.reward_max === ""
            ? null
            : Number(form.reward_max),
        severity_reward_matrix:
          form.severity_reward_matrix.trim() || null,
        program_rules: form.program_rules.trim(),
        submission_guidelines:
          form.submission_guidelines.trim(),
        start_date: new Date(
          form.start_date
        ).toISOString(),
        end_date: form.end_date
          ? new Date(
              form.end_date
            ).toISOString()
          : null,
        status: form.status,
        visibility: form.visibility,
        attachments:
          form.attachments.trim() || null,
        is_active: form.is_active,
      };

      const created = await createProgram(payload);

      navigate(
        `/company/programs/${created.id}`,
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "CREATE PROGRAM FAILED:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CompanyLayout title="Create Bug Bounty Program">
      <div className="min-h-full bg-slate-50">
        {/* HEADER */}

        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <button
              type="button"
              onClick={() =>
                navigate("/company/programs")
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Programs
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Shield size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Create Bug Bounty Program
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create a security research program for
                  vulnerability researchers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="mx-auto max-w-6xl px-6 py-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">
                Validation error
              </span>

              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* BASIC INFORMATION */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Program Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Basic details about your bug bounty
                  program.
                </p>
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                <Field
                  label="Program name"
                  required
                  value={form.program_name}
                  onChange={(value) =>
                    updateField(
                      "program_name",
                      value
                    )
                  }
                  placeholder="Example: VulnTriage Security Program"
                />

                <Field
                  label="Target website"
                  required
                  value={form.target_website}
                  onChange={(value) =>
                    updateField(
                      "target_website",
                      value
                    )
                  }
                  placeholder="https://example.com"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Description"
                    required
                    value={form.description}
                    onChange={(value) =>
                      updateField(
                        "description",
                        value
                      )
                    }
                    placeholder="Describe your security program..."
                    rows={4}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="In-scope targets"
                    required
                    value={form.scope}
                    onChange={(value) =>
                      updateField(
                        "scope",
                        value
                      )
                    }
                    placeholder="List domains, applications, APIs, mobile apps, etc."
                    rows={4}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Out-of-scope targets"
                    value={form.out_of_scope}
                    onChange={(value) =>
                      updateField(
                        "out_of_scope",
                        value
                      )
                    }
                    placeholder="List systems or activities that are not allowed..."
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* REWARDS */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Bounty & Severity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define the reward range for valid
                  vulnerabilities.
                </p>
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                <Field
                  label="Minimum reward"
                  type="number"
                  value={form.reward_min}
                  onChange={(value) =>
                    updateField(
                      "reward_min",
                      value
                    )
                  }
                  placeholder="500"
                />

                <Field
                  label="Maximum reward"
                  type="number"
                  value={form.reward_max}
                  onChange={(value) =>
                    updateField(
                      "reward_max",
                      value
                    )
                  }
                  placeholder="100000"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Severity reward matrix"
                    value={
                      form.severity_reward_matrix
                    }
                    onChange={(value) =>
                      updateField(
                        "severity_reward_matrix",
                        value
                      )
                    }
                    placeholder="Critical: ₹50,000+&#10;High: ₹20,000+&#10;Medium: ₹5,000+&#10;Low: ₹1,000+"
                    rows={5}
                  />
                </div>
              </div>
            </section>

            {/* RULES */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Program Rules
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tell researchers how they should
                  participate.
                </p>
              </div>

              <div className="space-y-5 px-6 py-6">
                <TextArea
                  label="Program rules"
                  required
                  value={form.program_rules}
                  onChange={(value) =>
                    updateField(
                      "program_rules",
                      value
                    )
                  }
                  placeholder="Example: Do not perform denial-of-service attacks. Do not access user data. Respect rate limits..."
                  rows={6}
                />

                <TextArea
                  label="Submission guidelines"
                  required
                  value={
                    form.submission_guidelines
                  }
                  onChange={(value) =>
                    updateField(
                      "submission_guidelines",
                      value
                    )
                  }
                  placeholder="Explain what information researchers must include in their vulnerability reports..."
                  rows={6}
                />
              </div>
            </section>

            {/* DATES & SETTINGS */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Schedule & Visibility
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure when and how researchers can
                  see the program.
                </p>
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                <Field
                  label="Start date"
                  required
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(value) =>
                    updateField(
                      "start_date",
                      value
                    )
                  }
                />

                <Field
                  label="End date"
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(value) =>
                    updateField(
                      "end_date",
                      value
                    )
                  }
                />

                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(value) =>
                    updateField(
                      "status",
                      value
                    )
                  }
                  options={[
                    {
                      value: "draft",
                      label: "Draft",
                    },
                    {
                      value: "active",
                      label: "Active",
                    },
                    {
                      value: "paused",
                      label: "Paused",
                    },
                    {
                      value: "closed",
                      label: "Closed",
                    },
                  ]}
                />

                <SelectField
                  label="Visibility"
                  value={form.visibility}
                  onChange={(value) =>
                    updateField(
                      "visibility",
                      value
                    )
                  }
                  options={[
                    {
                      value: "private",
                      label: "Private",
                    },
                    {
                      value: "public",
                      label: "Public",
                    },
                  ]}
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Attachments"
                    value={form.attachments}
                    onChange={(value) =>
                      updateField(
                        "attachments",
                        value
                      )
                    }
                    placeholder="Optional attachment information or links..."
                    rows={3}
                  />
                </div>

                <label className="md:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      updateField(
                        "is_active",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Program is active
                    </p>

                    <p className="text-xs text-slate-500">
                      Allow the program to operate according
                      to its status and visibility settings.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate("/company/programs")
                }
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create Program
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CompanyLayout>
  );
}

/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

function TextArea({
  label,
  required,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <textarea
        required={required}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}