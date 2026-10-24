import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import CompanyLayout from "../../components/company/CompanyLayout";

import {
  getCompanyProgramById,
  updateCompanyProgram,
  type BugBountyProgram,
  type ProgramStatus,
  type ProgramVisibility,
} from "../../api/company";

import { getErrorMessage } from "../../api/client";

export default function CompanyProgramEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [program, setProgram] =
    useState<BugBountyProgram | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    program_name: "",
    description: "",
    target_website: "",
    scope: "",
    out_of_scope: "",
    reward_min: null as number | null,
    reward_max: null as number | null,
    severity_reward_matrix: "",
    program_rules: "",
    submission_guidelines: "",
    start_date: "",
    end_date: null as string | null,
    status: "draft" as ProgramStatus,
    visibility: "private" as ProgramVisibility,
    attachments: null as string | null,
    is_active: true,
  });

  useEffect(() => {
    async function loadProgram() {
      if (!id) {
        setError("Program ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await getCompanyProgramById(Number(id));

        setProgram(data);

        setForm({
          program_name:
            data.program_name ?? "",

          description:
            data.description ?? "",

          target_website:
            data.target_website ?? "",

          scope:
            data.scope ?? "",

          out_of_scope:
            data.out_of_scope ?? "",

          reward_min:
            data.reward_min ?? null,

          reward_max:
            data.reward_max ?? null,

          severity_reward_matrix:
            data.severity_reward_matrix ?? "",

          program_rules:
            data.program_rules ?? "",

          submission_guidelines:
            data.submission_guidelines ?? "",

          start_date:
            data.start_date
              ? data.start_date.slice(0, 16)
              : "",

          end_date:
            data.end_date
              ? data.end_date.slice(0, 16)
              : null,

          status:
            data.status,

          visibility:
            data.visibility,

          attachments:
            data.attachments ?? null,

          is_active:
            data.is_active,
        });
      } catch (err) {
        console.error(
          "Failed to load program:",
          err
        );

        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadProgram();
  }, [id]);

  function updateField(
    field: string,
    value: unknown
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError("Program ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateCompanyProgram(
        Number(id),
        {
          ...form,
        }
      );

      setSuccess(
        "Bug Bounty Program updated successfully."
      );

      setTimeout(() => {
        navigate(
          `/company/programs/${id}`
        );
      }, 500);
    } catch (err) {
      console.error(
        "Failed to update program:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <CompanyLayout title="Edit Program">
        <div className="p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              Loading program...
            </p>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  if (!program) {
    return (
      <CompanyLayout title="Edit Program">
        <div className="p-6">
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || "Program not found."}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/company/programs")
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Programs
          </button>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout title="Edit Bug Bounty Program">
      <div className="p-6 md:p-8">

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/company/programs/${program.id}`
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Back to Program
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Edit Bug Bounty Program
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update your program information,
            scope, rewards and rules.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
        >

          {/* BASIC */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              Program Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Program Name *
                </label>

                <input
                  required
                  minLength={3}
                  value={form.program_name}
                  onChange={(e) =>
                    updateField(
                      "program_name",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Target Website *
                </label>

                <input
                  required
                  value={form.target_website}
                  onChange={(e) =>
                    updateField(
                      "target_website",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>
          </section>

          {/* DESCRIPTION */}
          <section>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description *
            </label>

            <textarea
              required
              minLength={10}
              rows={4}
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>

          {/* SCOPE */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              Security Scope
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  In-Scope Assets *
                </label>

                <textarea
                  required
                  rows={5}
                  value={form.scope}
                  onChange={(e) =>
                    updateField(
                      "scope",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Out-of-Scope Assets
                </label>

                <textarea
                  rows={5}
                  value={form.out_of_scope}
                  onChange={(e) =>
                    updateField(
                      "out_of_scope",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

            </div>
          </section>

          {/* RULES */}
          <section>
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Program Rules *
                </label>

                <textarea
                  required
                  minLength={10}
                  rows={6}
                  value={form.program_rules}
                  onChange={(e) =>
                    updateField(
                      "program_rules",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Submission Guidelines *
                </label>

                <textarea
                  required
                  minLength={10}
                  rows={6}
                  value={
                    form.submission_guidelines
                  }
                  onChange={(e) =>
                    updateField(
                      "submission_guidelines",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

            </div>
          </section>

          {/* REWARDS */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              Rewards
            </h2>

            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Minimum Reward
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.reward_min ?? ""}
                  onChange={(e) =>
                    updateField(
                      "reward_min",
                      e.target.value === ""
                        ? null
                        : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Maximum Reward
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.reward_max ?? ""}
                  onChange={(e) =>
                    updateField(
                      "reward_max",
                      e.target.value === ""
                        ? null
                        : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Severity Reward Matrix
                </label>

                <input
                  value={
                    form.severity_reward_matrix
                  }
                  onChange={(e) =>
                    updateField(
                      "severity_reward_matrix",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

            </div>
          </section>

          {/* LIFECYCLE */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              Program Lifecycle
            </h2>

            <div className="grid gap-5 md:grid-cols-4">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    updateField(
                      "status",
                      e.target.value as ProgramStatus
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="paused">
                    Paused
                  </option>

                  <option value="closed">
                    Closed
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Visibility
                </label>

                <select
                  value={form.visibility}
                  onChange={(e) =>
                    updateField(
                      "visibility",
                      e.target.value as ProgramVisibility
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                >
                  <option value="private">
                    Private
                  </option>

                  <option value="public">
                    Public
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Start Date *
                </label>

                <input
                  required
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) =>
                    updateField(
                      "start_date",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  End Date
                </label>

                <input
                  type="datetime-local"
                  value={form.end_date ?? ""}
                  onChange={(e) =>
                    updateField(
                      "end_date",
                      e.target.value === ""
                        ? null
                        : e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

            </div>
          </section>

          {/* ACTIVE */}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                updateField(
                  "is_active",
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />

            Program is active
          </label>

          {/* BUTTONS */}
          <div className="flex gap-3 border-t border-slate-200 pt-5">

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Update Program"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/company/programs/${program.id}`
                )
              }
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </CompanyLayout>
  );
}