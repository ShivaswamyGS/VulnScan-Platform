import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { AppLayout } from "../../components/layout/AppLayout";

import {
  approveCompany,
  getPendingCompanies,
  rejectCompany,
  type PendingCompany,
} from "../../api/adminCompanyApi";

import { getErrorMessage } from "../../api/client";

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<PendingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [processingId, setProcessingId] = useState<number | null>(null);

  const [rejectingCompany, setRejectingCompany] =
    useState<PendingCompany | null>(null);

  const [rejectReason, setRejectReason] = useState("");

  const loadCompanies = useCallback(async () => {
    try {
      setError("");

      const data = await getPendingCompanies();

      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getPendingCompanies();

        if (!cancelled) {
          setCompanies(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadCompanies();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleApprove(company: PendingCompany) {
    const confirmed = window.confirm(
      `Approve "${company.company_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(company.id);
      setError("");

      await approveCompany(company.id);

      setCompanies((current) =>
        current.filter((item) => item.id !== company.id)
      );
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectModal(company: PendingCompany) {
    setRejectReason("");
    setRejectingCompany(company);
  }

  function closeRejectModal() {
    if (processingId !== null) {
      return;
    }

    setRejectingCompany(null);
    setRejectReason("");
  }

  async function handleReject() {
    if (!rejectingCompany) {
      return;
    }

    try {
      setProcessingId(rejectingCompany.id);
      setError("");

      await rejectCompany(
        rejectingCompany.id,
        rejectReason.trim() || undefined
      );

      setCompanies((current) =>
        current.filter(
          (item) => item.id !== rejectingCompany.id
        )
      );

      setRejectingCompany(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  const filteredCompanies = companies.filter((company) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      company.company_name
        ?.toLowerCase()
        .includes(query) ||
      company.email
        ?.toLowerCase()
        .includes(query) ||
      company.industry
        ?.toLowerCase()
        .includes(query) ||
      company.country
        ?.toLowerCase()
        .includes(query)
    );
  });

  return (
    <AppLayout title="Companies">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Building2 size={20} />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Company Approvals
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Review and manage company registrations waiting
                  for administrator approval.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {companies.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock3 size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Showing
                </p>

                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {filteredCompanies.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Search size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <p className="mt-2 text-sm font-semibold text-emerald-600">
                  Approval workflow active
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company, email, industry..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Pending Company Registrations
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Newly registered companies appear here until they
              are approved or rejected.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Building2 size={25} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No pending companies
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                {search
                  ? "No company registrations match your search."
                  : "There are currently no company registrations waiting for approval."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Company
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Industry
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Country
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Registered
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCompanies.map((company) => {
                    const isProcessing =
                      processingId === company.id;

                    return (
                      <tr
                        key={company.id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {company.company_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Company ID #{company.id}
                            </p>

                            {company.website && (
                              <p className="mt-1 text-xs text-blue-600">
                                {company.website}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-700">
                            {company.email}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {company.phone || "No phone provided"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {company.industry || "—"}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {company.country || "—"}
                        </td>

                        <td className="px-6 py-5 text-xs text-slate-500">
                          {formatDate(company.created_at)}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                            <Clock3 size={12} />
                            Pending
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(company)
                              }
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CheckCircle2 size={14} />

                              {isProcessing
                                ? "Processing..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openRejectModal(company)
                              }
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <XCircle size={14} />

                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* REJECT MODAL */}
      {rejectingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Reject Company
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Rejecting{" "}
                  <span className="font-medium text-slate-700">
                    {rejectingCompany.company_name}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeRejectModal}
                disabled={processingId !== null}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">
                Rejection reason
                <span className="ml-1 text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                value={rejectReason}
                onChange={(event) =>
                  setRejectReason(event.target.value)
                }
                rows={4}
                placeholder="Enter the reason for rejecting this registration..."
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={processingId !== null}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={processingId !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={16} />

                {processingId !== null
                  ? "Rejecting..."
                  : "Reject Company"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}