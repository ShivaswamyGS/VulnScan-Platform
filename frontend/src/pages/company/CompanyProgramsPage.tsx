import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

import CompanyLayout from "../../components/company/CompanyLayout";

import {
  getCompanyPrograms,
  deleteCompanyProgram,
  type BugBountyProgram,
} from "../../api/company";

import { getErrorMessage } from "../../api/client";

export default function CompanyProgramsPage() {
  const [programs, setPrograms] = useState<BugBountyProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // =========================================================
  // LOAD COMPANY PROGRAMS
  // =========================================================

  async function loadPrograms() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getCompanyPrograms();

      setPrograms(data);
    } catch (err) {
      console.error("Failed to load company programs:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  // =========================================================
  // DELETE PROGRAM
  // =========================================================

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Bug Bounty Program?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);

      await deleteCompanyProgram(id);

      setPrograms((current) =>
        current.filter((program) => program.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete company program:", err);
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================================
  // STATUS STYLE
  // =========================================================

  function getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";

      case "paused":
        return "bg-yellow-100 text-yellow-700";

      case "closed":
        return "bg-red-100 text-red-700";

      case "draft":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // =========================================================
  // VISIBILITY STYLE
  // =========================================================

  function getVisibilityClass(visibility: string) {
    if (visibility?.toLowerCase() === "public") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <CompanyLayout title="Bug Bounty Programs">
      <div className="p-6 md:p-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Bug Bounty Programs
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage your company's Bug Bounty Programs.
            </p>
          </div>

          <Link
            to="/company/programs/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={17} />
            Create Program
          </Link>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              Loading your Bug Bounty Programs...
            </p>
          </div>
        ) : programs.length === 0 ? (

          /* ===================================================
             EMPTY STATE
          =================================================== */

          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Plus size={22} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No Bug Bounty Programs
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              You haven't created any Bug Bounty Programs yet.
              Create your first program to allow security testers
              to participate.
            </p>

            <Link
              to="/company/programs/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Create Your First Program
            </Link>

          </div>

        ) : (

          /* ===================================================
             PROGRAM LIST
          =================================================== */

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {programs.map((program) => (

              <div
                key={program.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >

                {/* TITLE */}

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <h3 className="truncate text-base font-semibold text-slate-900">
                      {program.program_name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {program.target_website}
                    </p>

                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      program.status
                    )}`}
                  >
                    {program.status}
                  </span>

                </div>

                {/* DESCRIPTION */}

                <p className="mt-4 line-clamp-3 text-sm text-slate-500">
                  {program.description}
                </p>

                {/* VISIBILITY */}

                <div className="mt-4 flex items-center gap-2">

                  <span className="text-xs font-medium text-slate-500">
                    Visibility:
                  </span>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getVisibilityClass(
                      program.visibility
                    )}`}
                  >
                    {program.visibility}
                  </span>

                </div>

                {/* REWARD */}

                <div className="mt-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Reward
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">

                    {program.reward_min !== null ||
                    program.reward_max !== null
                      ? `₹${program.reward_min ?? 0} - ₹${
                          program.reward_max ?? 0
                        }`
                      : "No reward specified"}

                  </p>

                </div>

                {/* ACTIVE */}

                <div className="mt-3">

                  <span
                    className={`text-xs font-medium ${
                      program.is_active
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {program.is_active
                      ? "Program enabled"
                      : "Program disabled"}
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="mt-auto flex flex-wrap gap-2 pt-5">

                  {/* VIEW */}

                  <Link
                    to={`/company/programs/${program.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={14} />
                    View
                  </Link>

                  {/* EDIT */}

                  <Link
                    to={`/company/programs/${program.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() => handleDelete(program.id)}
                    disabled={deletingId === program.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={14} />

                    {deletingId === program.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </CompanyLayout>
  );
}