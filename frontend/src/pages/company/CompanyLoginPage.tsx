import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useCompanyAuth } from "../../context/CompanyAuthContext";

export default function CompanyLoginPage() {
  const navigate = useNavigate();

  const { login } = useCompanyAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(email.trim(), password);

      console.log(
        "Stored Token:",
        localStorage.getItem("company_access_token")
      );

      navigate("/company/dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("Company login error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Company login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Company Login
          </h1>

          <p className="text-center text-gray-500 mt-2">
            Login to your company account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg mb-5 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="company-email"
              className="block font-medium text-gray-900"
            >
              Email
            </label>

            <input
              id="company-email"
              type="email"
              placeholder="Enter company email"
              autoComplete="email"
              className="w-full mt-2 border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="company-password"
              className="block font-medium text-gray-900"
            >
              Password
            </label>

            <input
              id="company-password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full mt-2 border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white rounded-lg p-3 font-medium transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <div className="mt-6 text-center text-sm text-gray-700">
          Don't have an account?

          <Link
            to="/company/register"
            className="text-blue-600 ml-2 font-medium hover:underline"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}