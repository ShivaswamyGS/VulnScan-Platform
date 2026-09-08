import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getResearcherProgramById,
  type ResearcherProgram,
} from "../../api/researcherPrograms";

import {
  createBookmark,
  getMyBookmarks,
  deleteBookmark,
} from "../../api/bookmarks";

export default function ProgramDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [program, setProgram] = useState<ResearcherProgram | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState("");

  // =========================================================
  // LOAD PROGRAM
  // =========================================================

  useEffect(() => {
    if (!id) {
      setError("Program ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProgram() {
      try {
        setLoading(true);
        setError("");

        const programId = Number(id);

        if (Number.isNaN(programId)) {
          throw new Error("Invalid program ID");
        }

        const data = await getResearcherProgramById(programId);

        if (!cancelled) {
          setProgram(data);
        }
      } catch (err) {
        console.error("Unable to load program:", err);

        if (!cancelled) {
          setError("Unable to load bug bounty program.");
          setProgram(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProgram();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =========================================================
  // LOAD BOOKMARK STATUS
  // =========================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    async function loadBookmarkStatus() {
      try {
        const programId = Number(id);

        if (Number.isNaN(programId)) {
          return;
        }

        const bookmarks = await getMyBookmarks();

        const existingBookmark = bookmarks.find(
          (bookmark) => bookmark.program_id === programId
        );

        if (!cancelled) {
          if (existingBookmark) {
            setBookmarked(true);
            setBookmarkId(existingBookmark.id);
          } else {
            setBookmarked(false);
            setBookmarkId(null);
          }
        }
      } catch (err) {
        console.error("Unable to load bookmark status:", err);
      }
    }

    loadBookmarkStatus();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =========================================================
  // BOOKMARK / REMOVE BOOKMARK
  // =========================================================

  async function handleBookmark() {
    if (!program || bookmarkLoading) {
      return;
    }

    try {
      setBookmarkLoading(true);
      setBookmarkError("");

      if (bookmarked && bookmarkId !== null) {
        await deleteBookmark(bookmarkId);

        setBookmarked(false);
        setBookmarkId(null);
      } else {
        const bookmark = await createBookmark(program.id);

        setBookmarked(true);
        setBookmarkId(bookmark.id);
      }
    } catch (err) {
      console.error("Bookmark error:", err);

      setBookmarkError("Unable to update bookmark.");
    } finally {
      setBookmarkLoading(false);
    }
  }

  // =========================================================
  // STATUS STYLE
  // =========================================================

  function getStatusStyle(status?: string) {
    switch (status?.toLowerCase()) {
      case "active":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "paused":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "closed":
        return "border-red-200 bg-red-50 text-red-700";

      case "draft":
        return "border-slate-200 bg-slate-100 text-slate-600";

      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-5">
            <div className="h-5 w-32 rounded bg-slate-200" />

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="h-8 w-72 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-96 max-w-full rounded bg-slate-200" />
            </div>

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="mt-4 h-20 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/programs"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Programs
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load program
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PROGRAM NOT FOUND
  // =========================================================

  if (!program) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/programs"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Programs
          </Link>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">🔍</div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Program not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              The requested bug bounty program could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">

        {/* BACK */}
        <Link
          to="/programs"
          className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
        >
          ← Back to Programs
        </Link>

        {/* HEADER */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-[var(--color-accent)]">
                    {program.program_name
                      ?.charAt(0)
                      ?.toUpperCase() || "P"}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Bug Bounty Program
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {program.program_name}
                    </h1>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Target Website
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {program.target_website || "Not specified"}
                  </p>
                </div>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                  program.status
                )}`}
              >
                {program.status || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Description
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {program.description || "No description provided."}
          </p>
        </section>

        {/* SCOPE */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Scope
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {program.scope || "No scope information provided."}
          </p>
        </section>

        {/* OUT OF SCOPE */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Out of Scope
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {program.out_of_scope ||
              "No out-of-scope information provided."}
          </p>
        </section>

        {/* PROGRAM RULES */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Program Rules
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {program.program_rules ||
              "No program rules provided."}
          </p>
        </section>

        {/* SUBMISSION GUIDELINES */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Submission Guidelines
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {program.submission_guidelines ||
              "No submission guidelines provided."}
          </p>
        </section>

        {/* REWARD */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Reward
          </h2>

          <div className="mt-4 rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reward Range
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              ₹{program.reward_min ?? 0} – ₹{program.reward_max ?? 0}
            </p>
          </div>

          {program.severity_reward_matrix && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700">
                Severity Reward Matrix
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {program.severity_reward_matrix}
              </p>
            </div>
          )}
        </section>

        {/* PROGRAM PERIOD */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Program Period
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Start Date
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {program.start_date
                  ? new Date(program.start_date).toLocaleString()
                  : "Not specified"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                End Date
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {program.end_date
                  ? new Date(program.end_date).toLocaleString()
                  : "No end date"}
              </p>
            </div>

          </div>
        </section>

        {/* BOOKMARK ERROR */}
        {bookmarkError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {bookmarkError}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-6 flex flex-wrap gap-3 pb-8">

          {/* IMPORTANT:
              This page is /programs/:id,
              so submission goes to /programs/:id/submit.
          */}
          <Link
            to={`/programs/${program.id}/submit`}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Submit Vulnerability →
          </Link>

          <button
            type="button"
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookmarkLoading
              ? "Updating..."
              : bookmarked
              ? "★ Bookmarked"
              : "☆ Bookmark"}
          </button>

          <Link
            to="/programs"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Programs
          </Link>

          <Link
  to={`/researcher/programs/${program.id}/submit`}
  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
>
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 5v14m-7-7h14"
    />
  </svg>

  Submit Vulnerability
</Link>

        </div>
      </div>
    </div>
  );
}