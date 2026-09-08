import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getResearcherPrograms,
  type ResearcherProgram,
} from "../../api/researcherPrograms";

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3 5 6v5c0 4.6 2.9 8.3 7 10 4.1-1.7 7-5.4 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.5-3.5" />
    </svg>
  );
}

function getStatusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };

    case "paused":
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };

    case "closed":
      return {
        badge: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
      };

    case "draft":
      return {
        badge: "border-slate-200 bg-slate-100 text-slate-600",
        dot: "bg-slate-400",
      };

    default:
      return {
        badge: "border-blue-200 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
      };
  }
}

function formatReward(value?: number | null) {
  if (value === null || value === undefined) {
    return "₹0";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ResearcherProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  async function loadPrograms(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getResearcherPrograms();

      setPrograms(data);
    } catch (err) {
      console.error("Failed to load researcher programs:", err);
      setError("Unable to load bug bounty programs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        setLoading(true);
        setError("");

        const data = await getResearcherPrograms();

        if (!cancelled) {
          setPrograms(data);
        }
      } catch (err) {
        console.error("Failed to load researcher programs:", err);

        if (!cancelled) {
          setError("Unable to load bug bounty programs.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  const statuses = useMemo(() => {
    const unique = new Set(
      programs
        .map((program) => program.status?.toLowerCase())
        .filter(Boolean)
    );

    return Array.from(unique).sort();
  }, [programs]);

  const activePrograms = useMemo(() => {
    return programs.filter(
      (program) => program.status?.toLowerCase() === "active"
    ).length;
  }, [programs]);

  const totalRewards = useMemo(() => {
    return programs.reduce((total, program) => {
      return total + Number(program.reward_max || 0);
    }, 0);
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = programs.filter((program) => {
      const matchesSearch =
        !query ||
        program.program_name?.toLowerCase().includes(query) ||
        program.target_website?.toLowerCase().includes(query) ||
        program.description?.toLowerCase().includes(query) ||
        program.scope?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        program.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "reward") {
        return Number(b.reward_max || 0) - Number(a.reward_max || 0);
      }

      if (sortBy === "name") {
        return (a.program_name || "").localeCompare(b.program_name || "");
      }

      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });
  }, [programs, search, statusFilter, sortBy]);

  const hasFilters =
    search.trim().length > 0 ||
    statusFilter !== "all" ||
    sortBy !== "newest";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setSortBy("newest");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-3 h-9 w-72 rounded bg-slate-200" />
            <div className="mt-3 h-5 w-full max-w-2xl rounded bg-slate-200" />

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>

            <div className="mt-7 h-24 rounded-2xl border border-slate-200 bg-white" />

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-80 rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-50 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <ShieldIcon />
                    Researcher Portal
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    Bug Bounty Programs
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Discover security programs, understand their scope and
                    reward policies, and responsibly report vulnerabilities.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadPrograms(true)}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className={refreshing ? "animate-spin" : ""}>
                    <RefreshIcon />
                  </span>

                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ====================================================== */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Programs
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShieldIcon />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              {programs.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Programs available to browse
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Programs
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              {activePrograms}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently accepting security research
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Listed Rewards
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                ₹
              </div>
            </div>

            <p className="mt-3 truncate text-2xl font-bold text-slate-950">
              {formatReward(totalRewards)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Combined maximum rewards shown
            </p>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                !
              </div>

              <div className="flex-1">
                <p className="font-semibold text-red-900">
                  Unable to load programs
                </p>

                <p className="mt-1 text-sm text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={() => loadPrograms()}
                  className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            SEARCH + FILTERS
        ====================================================== */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by program, website, description or scope..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <FilterIcon />
                </span>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:w-44"
                >
                  <option value="all">All statuses</option>

                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:w-44"
              >
                <option value="newest">Newest first</option>
                <option value="reward">Highest reward</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* =====================================================
            RESULT HEADER
        ====================================================== */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {filteredPrograms.length}{" "}
              {filteredPrograms.length === 1 ? "program" : "programs"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {hasFilters
                ? "Matching your current filters"
                : "Browse all available programs"}
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 sm:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}
        {filteredPrograms.length === 0 && !error && (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <SearchIcon />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              {programs.length === 0
                ? "No bug bounty programs yet"
                : "No matching programs"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {programs.length === 0
                ? "There are currently no programs available for researchers. Check back later for new opportunities."
                : "We couldn't find any programs matching your search or selected filters."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* =====================================================
            PROGRAM CARDS
        ====================================================== */}
        {filteredPrograms.length > 0 && (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPrograms.map((program) => {
              const statusStyle = getStatusStyle(program.status);

              return (
                <article
                  key={program.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                >
                  {/* CARD HEADER */}
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-sm">
                          {program.program_name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </div>

                        <div className="min-w-0">
                          <h2
                            title={program.program_name}
                            className="truncate text-base font-bold text-slate-950"
                          >
                            {program.program_name}
                          </h2>

                          <p
                            title={program.target_website}
                            className="mt-1 truncate text-xs text-slate-500"
                          >
                            {program.target_website || "Website not specified"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyle.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                        />

                        {program.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
                      {program.description ||
                        "No description has been provided for this security program."}
                    </p>

                    {/* REWARD */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Min Reward
                        </p>

                        <p className="mt-1.5 text-base font-bold text-slate-900">
                          {formatReward(program.reward_min)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          Max Reward
                        </p>

                        <p className="mt-1.5 text-base font-bold text-emerald-700">
                          {formatReward(program.reward_max)}
                        </p>
                      </div>
                    </div>

                    {/* SCOPE */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Scope
                        </p>

                        {program.visibility && (
                          <span className="text-[10px] font-semibold capitalize text-slate-400">
                            {program.visibility}
                          </span>
                        )}
                      </div>

                      <p
                        title={program.scope}
                        className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600"
                      >
                        {program.scope || "Scope information not provided."}
                      </p>
                    </div>

                    {/* ACTION */}
                    <div className="mt-auto pt-6">
                      <Link
                        to={`/programs/${program.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                      >
                        View Program

                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          <ArrowRightIcon />
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}