import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Pencil,
  Save,
  X,
  ShieldCheck,
  CalendarDays,
  Hash,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import CompanyLayout from "../../components/company/CompanyLayout";
import {
  getCompanyProfile,
  updateCompanyProfile,
  type CompanyProfile,
} from "../../api/company";

interface FormData {
  company_name: string;
  website: string;
  industry: string;
  country: string;
  phone: string;
}

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  const [form, setForm] = useState<FormData>({
    company_name: "",
    website: "",
    industry: "",
    country: "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const data = await getCompanyProfile();

      setCompany(data);

      setForm({
        company_name: data.company_name || "",
        website: data.website || "",
        industry: data.industry || "",
        country: data.country || "",
        phone: data.phone || "",
      });
    } catch (err) {
      console.error("Failed to load company profile:", err);
      setError("Failed to load company profile.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof FormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleCancel() {
    if (!company) return;

    setForm({
      company_name: company.company_name || "",
      website: company.website || "",
      industry: company.industry || "",
      country: company.country || "",
      phone: company.phone || "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated = await updateCompanyProfile({
        company_name: form.company_name,
        website: form.website || undefined,
        industry: form.industry || undefined,
        country: form.country || undefined,
        phone: form.phone || undefined,
      });

      setCompany(updated);

      setForm({
        company_name: updated.company_name || "",
        website: updated.website || "",
        industry: updated.industry || "",
        country: updated.country || "",
        phone: updated.phone || "",
      });

      setEditing(false);
      setSuccess("Company profile updated successfully.");

      window.setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Failed to update company profile:", err);
      setError("Failed to update company profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <CompanyLayout title="Company Profile">
        <div className="min-h-[70vh] bg-slate-50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="mb-8 h-8 w-56 rounded-lg bg-slate-200" />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-96 rounded-2xl bg-white shadow-sm" />

              <div className="h-96 rounded-2xl bg-white shadow-sm lg:col-span-2" />
            </div>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  if (!company) {
    return (
      <CompanyLayout title="Company Profile">
        <div className="min-h-[70vh] bg-slate-50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-red-100 p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Unable to load company profile
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {error || "Company profile not found."}
                  </p>

                  <button
                    type="button"
                    onClick={loadProfile}
                    className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout title="Company Profile">
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-5 md:p-8">
        <div className="mx-auto max-w-7xl">

          {/* PAGE HEADER */}
          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                <ShieldCheck className="h-4 w-4" />
                Company Account
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Company Profile
              </h1>

              <p className="mt-1.5 text-sm text-slate-500">
                Manage your company identity, contact details and account
                information.
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setSuccess("");
                  setError("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* ALERTS */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">

            {/* COMPANY CARD */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

              <div className="-mt-12 px-6 pb-6">
                <div className="flex items-end justify-between">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-50 shadow-md">
                    <Building2 className="h-11 w-11 text-blue-600" />
                  </div>

                  <span
                    className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      company.is_active
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-red-50 text-red-700 ring-1 ring-red-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        company.is_active
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />

                    {company.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-5">
                  <h2 className="break-words text-xl font-bold text-slate-900">
                    {company.company_name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {company.industry || "Industry not specified"}
                  </p>
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div className="space-y-5">

                  {/* EMAIL */}
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-slate-800">
                        {company.email}
                      </p>
                    </div>
                  </div>

                  {/* WEBSITE */}
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Globe className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Website
                      </p>

                      {company.website ? (
                        <a
                          href={
                            company.website.startsWith("http")
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-sm font-medium text-blue-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-slate-400">
                          Not specified
                        </p>
                      )}
                    </div>
                  </div>

                  {/* COUNTRY */}
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <MapPin className="h-4 w-4 text-slate-500" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Country
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {company.country || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Phone className="h-4 w-4 text-slate-500" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {company.phone || "Not specified"}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* COMPANY INFORMATION */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSave}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 px-6 py-5 md:px-7">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Company Information
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Keep your company details accurate and up to date.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-7">
                  <div className="grid gap-5 md:grid-cols-2">

                    {/* COMPANY NAME */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Company Name
                      </label>

                      <input
                        value={form.company_name}
                        onChange={(e) =>
                          handleChange(
                            "company_name",
                            e.target.value
                          )
                        }
                        disabled={!editing}
                        required
                        minLength={2}
                        maxLength={200}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                        placeholder="Enter company name"
                      />
                    </div>

                    {/* EMAIL */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Login Email
                      </label>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={company.email}
                          disabled
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-500"
                        />
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400">
                        Your company login email cannot be changed from
                        this page.
                      </p>
                    </div>

                    {/* WEBSITE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Website
                      </label>

                      <div className="relative">
                        <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={form.website}
                          onChange={(e) =>
                            handleChange(
                              "website",
                              e.target.value
                            )
                          }
                          disabled={!editing}
                          placeholder="https://example.com"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* INDUSTRY */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Industry
                      </label>

                      <input
                        value={form.industry}
                        onChange={(e) =>
                          handleChange(
                            "industry",
                            e.target.value
                          )
                        }
                        disabled={!editing}
                        placeholder="Technology"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>

                    {/* COUNTRY */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Country
                      </label>

                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={form.country}
                          onChange={(e) =>
                            handleChange(
                              "country",
                              e.target.value
                            )
                          }
                          disabled={!editing}
                          placeholder="India"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* PHONE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone
                      </label>

                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={form.phone}
                          onChange={(e) =>
                            handleChange(
                              "phone",
                              e.target.value
                            )
                          }
                          disabled={!editing}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  {editing && (
                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />

                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* ACCOUNT INFORMATION */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Account Information
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Overview of your company account.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">

              {/* COMPANY ID */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-slate-400" />

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Company ID
                  </p>
                </div>

                <p className="mt-2 font-mono text-sm font-semibold text-slate-800">
                  #{company.id}
                </p>
              </div>

              {/* ACCOUNT STATUS */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Account Status
                  </p>
                </div>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    company.is_active
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {company.is_active ? "Active" : "Inactive"}
                </p>
              </div>

              {/* REGISTERED */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-slate-400" />

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Registered
                  </p>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {company.created_at
                    ? new Date(company.created_at).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </CompanyLayout>
  );
}