import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Image,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  CalendarDays,
} from "lucide-react";

import CompanyLayout from "../../components/company/CompanyLayout";
import {
  getCompanyProfile,
  updateCompanyProfile,
  type CompanyProfile,
  type CompanyUpdateInput,
} from "../../api/company";

export default function CompanySettingsPage() {
  const [company, setCompany] =
    useState<CompanyProfile | null>(null);

  const [form, setForm] =
    useState<CompanyUpdateInput>({
      company_name: "",
      website: "",
      industry: "",
      country: "",
      phone: "",
      logo: "",
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompany();
  }, []);

  async function loadCompany() {
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
        logo: data.logo || "",
      });
    } catch (err) {
      console.error("Failed to load company profile:", err);
      setError("Failed to load company profile.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof CompanyUpdateInput,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.company_name?.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated = await updateCompanyProfile({
        company_name: form.company_name.trim(),
        website: form.website?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
        country: form.country?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        logo: form.logo?.trim() || undefined,
      });

      setCompany(updated);

      setForm({
        company_name: updated.company_name || "",
        website: updated.website || "",
        industry: updated.industry || "",
        country: updated.country || "",
        phone: updated.phone || "",
        logo: updated.logo || "",
      });

      setMessage(
        "Company settings updated successfully."
      );

      window.setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (err) {
      console.error(
        "Failed to update company profile:",
        err
      );

      setError("Failed to update company settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <CompanyLayout title="Company Settings">
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-5 md:p-8">
          <div className="mx-auto max-w-6xl animate-pulse">
            <div className="mb-8 h-8 w-64 rounded-lg bg-slate-200" />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-80 rounded-2xl bg-white shadow-sm" />

              <div className="h-[520px] rounded-2xl bg-white shadow-sm lg:col-span-2" />
            </div>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout title="Company Settings">
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-5 md:p-8">
        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div className="mb-7">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <ShieldCheck className="h-4 w-4" />
              Account Configuration
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Company Settings
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Manage your company profile and account information.
            </p>
          </div>

          {/* ALERTS */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Changes saved
                </p>

                <p className="mt-0.5">
                  {message}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">

            {/* ACCOUNT SUMMARY */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

              <div className="-mt-10 px-6 pb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-blue-50 shadow-md">
                  {company?.logo ? (
                    <img
                      src={company.logo}
                      alt={`${company.company_name} logo`}
                      className="h-full w-full rounded-xl object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <Building2 className="h-9 w-9 text-blue-600" />
                  )}
                </div>

                <div className="mt-5">
                  <h2 className="break-words text-xl font-bold text-slate-900">
                    {company?.company_name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {company?.industry ||
                      "Industry not specified"}
                  </p>
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div className="space-y-4">

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
                        {company?.email}
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

                      {company?.website ? (
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
                        {company?.country ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <ShieldCheck className="h-4 w-4 text-slate-500" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Account Status
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          company?.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {company?.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* SETTINGS FORM */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 px-6 py-5 md:px-7">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Company Profile
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Update the information displayed across the platform.
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
                        type="text"
                        value={form.company_name || ""}
                        onChange={(event) =>
                          updateField(
                            "company_name",
                            event.target.value
                          )
                        }
                        required
                        minLength={2}
                        maxLength={200}
                        disabled={saving}
                        placeholder="Enter company name"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                          type="email"
                          value={company?.email || ""}
                          disabled
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-500"
                        />
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400">
                        Login email cannot be changed from company settings.
                      </p>
                    </div>

                    {/* INDUSTRY */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Industry
                      </label>

                      <input
                        type="text"
                        value={form.industry || ""}
                        onChange={(event) =>
                          updateField(
                            "industry",
                            event.target.value
                          )
                        }
                        disabled={saving}
                        placeholder="Technology"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>

                    {/* WEBSITE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Website
                      </label>

                      <div className="relative">
                        <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="text"
                          value={form.website || ""}
                          onChange={(event) =>
                            updateField(
                              "website",
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="https://example.com"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* COUNTRY */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Country
                      </label>

                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="text"
                          value={form.country || ""}
                          onChange={(event) =>
                            updateField(
                              "country",
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="India"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                          type="tel"
                          value={form.phone || ""}
                          onChange={(event) =>
                            updateField(
                              "phone",
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* LOGO */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Logo URL
                      </label>

                      <div className="relative">
                        <Image className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="text"
                          value={form.logo || ""}
                          onChange={(event) =>
                            updateField(
                              "logo",
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="https://example.com/logo.png"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400">
                        Provide a publicly accessible image URL.
                      </p>
                    </div>
                  </div>

                  {/* SAVE BUTTON */}
                  <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />

                      {saving
                        ? "Saving Changes..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* ACCOUNT INFORMATION */}
          {company && (
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
                      Basic information about your company account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-3">

                {/* ID */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-slate-400" />

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Company ID
                    </p>
                  </div>

                  <p className="mt-2 font-mono text-sm font-semibold text-slate-800">
                    #{company.id}
                  </p>
                </div>

                {/* STATUS */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
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
                    {company.is_active
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                {/* CREATED */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Registered
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {company.created_at ? new Date(company.created_at).toLocaleDateString() : "Not available"}
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </CompanyLayout>
  );
}