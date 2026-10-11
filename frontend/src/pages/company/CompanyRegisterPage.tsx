import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import { registerCompany } from "../../api/company";

interface CompanyForm {
  company_name: string;
  email: string;
  password: string;
  website: string;
  industry: string;
  country: string;
  phone: string;
}

export default function CompanyRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CompanyForm>({
    company_name: "",
    email: "",
    password: "",
    website: "",
    industry: "",
    country: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof CompanyForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validateForm(): string | null {
    const companyName = form.company_name.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!companyName) {
      return "Company name is required.";
    }

    if (companyName.length < 2) {
      return "Company name must be at least 2 characters.";
    }

    if (!email) {
      return "Company email is required.";
    }

    // Basic email validation.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return "Please enter a valid company email address.";
    }

    if (!password) {
      return "Password is required.";
    }

    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (password.length > 128) {
      return "Password cannot contain more than 128 characters.";
    }

    return null;
  }

  function getValidationMessages(errors: any[]): string {
    if (!Array.isArray(errors) || errors.length === 0) {
      return "Please check the information you entered.";
    }

    const messages = errors
      .map((item) => {
        const location = Array.isArray(item.loc)
          ? item.loc[item.loc.length - 1]
          : "";

        const message = item.msg || "Invalid value.";

        if (location === "company_name") {
          return `Company name: ${message}`;
        }

        if (location === "email") {
          return `Email: ${message}`;
        }

        if (location === "password") {
          return `Password: ${message}`;
        }

        if (location === "website") {
          return `Website: ${message}`;
        }

        if (location === "phone") {
          return `Phone: ${message}`;
        }

        return message;
      })
      .filter(Boolean);

    return messages.join(" ");
  }

  function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      // No backend response = server/network problem.
      if (!error.response) {
        return "Cannot connect to the backend server. Please make sure the backend is running.";
      }

      const data = error.response.data;

      // Our backend AppException format:
      // { "detail": "A company with this name already exists" }
      if (typeof data?.detail === "string") {
        return data.detail;
      }

      // Backend validation format:
      // {
      //   "detail": "Validation error",
      //   "errors": [...]
      // }
      if (Array.isArray(data?.errors)) {
        return getValidationMessages(data.errors);
      }

      if (typeof data?.message === "string") {
        return data.message;
      }

      if (typeof data?.error === "string") {
        return data.error;
      }

      switch (error.response.status) {
        case 400:
          return "The registration information is invalid.";

        case 409:
          return "A company with these details already exists.";

        case 422:
          return "Please check the registration details and try again.";

        case 500:
          return "The server encountered an error while creating the company.";

        default:
          return `Company registration failed with status ${error.response.status}.`;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Unable to register company.";
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await registerCompany({
        ...form,
        company_name: form.company_name.trim(),
        email: form.email.trim(),
      });

      navigate("/company/login", {
        replace: true,
        state: {
          message:
            "Company registration submitted successfully. Your account is waiting for administrator approval.",
        },
      });
    } catch (err: unknown) {
      console.error("Company registration error:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Company Registration
          </h1>

          <p className="text-gray-500 mt-2">
            Create your company account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-5 text-sm"
            role="alert"
          >
            <div className="font-semibold mb-1">
              Registration failed
            </div>

            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
        >

          {/* Company Name */}
          <div>
            <label
              htmlFor="company-name"
              className="block font-medium text-gray-900 mb-1"
            >
              Company Name
            </label>

            <input
              id="company-name"
              type="text"
              placeholder="Enter company name"
              value={form.company_name}
              onChange={(e) =>
                updateField("company_name", e.target.value)
              }
              disabled={loading}
              required
              minLength={2}
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="company-email"
              className="block font-medium text-gray-900 mb-1"
            >
              Company Email
            </label>

            <input
              id="company-email"
              type="email"
              placeholder="company@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
              disabled={loading}
              required
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="company-password"
              className="block font-medium text-gray-900 mb-1"
            >
              Password
            </label>

            <input
              id="company-password"
              type="password"
              placeholder="Enter password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) =>
                updateField("password", e.target.value)
              }
              disabled={loading}
              required
              minLength={8}
              maxLength={128}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />

            <p className="text-xs text-gray-500 mt-1">
              Password must contain at least 8 characters.
            </p>
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="company-website"
              className="block font-medium text-gray-900 mb-1"
            >
              Website
            </label>

            <input
              id="company-website"
              type="text"
              placeholder="https://example.com"
              value={form.website}
              onChange={(e) =>
                updateField("website", e.target.value)
              }
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Industry */}
          <div>
            <label
              htmlFor="company-industry"
              className="block font-medium text-gray-900 mb-1"
            >
              Industry
            </label>

            <input
              id="company-industry"
              type="text"
              placeholder="e.g. Software, Finance, Healthcare"
              value={form.industry}
              onChange={(e) =>
                updateField("industry", e.target.value)
              }
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="company-country"
              className="block font-medium text-gray-900 mb-1"
            >
              Country
            </label>

            <input
              id="company-country"
              type="text"
              placeholder="Enter country"
              value={form.country}
              onChange={(e) =>
                updateField("country", e.target.value)
              }
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="company-phone"
              className="block font-medium text-gray-900 mb-1"
            >
              Phone
            </label>

            <input
              id="company-phone"
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) =>
                updateField("phone", e.target.value)
              }
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Register */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white p-3 rounded-lg font-medium transition ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? "Registering..."
              : "Register Company"}
          </button>
        </form>

        {/* Login */}
        <div className="mt-6 text-center text-sm text-gray-700">
          Already have an account?

          <Link
            to="/company/login"
            className="text-blue-600 ml-2 font-medium hover:underline"
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}