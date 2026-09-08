import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

import { getCompanyReports } from "../../api/companyReports";
import { useNavigate } from "react-router-dom";
import CompanyLayout from "../../components/company/CompanyLayout";

interface Report {
  id: number;
  title: string;
  description: string;
  affected_module: string;
  category: string;
  priority: number | null;
  submission_date: string;

  reporter: {
    full_name: string;
    email: string;
    department: string | null;
    designation: string | null;
    employee_id: string | null;
  };

  status: {
    name: string;
    is_terminal: boolean;
  };

  predictions: {
    predicted_severity: "critical" | "high" | "medium" | "low";
    confidence_score: number;
  }[];
}

export default function CompanyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const data = await getCompanyReports();

      setReports(data);
      setFilteredReports(data);
    } catch (err) {
      console.error("Failed to load company reports:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const value = search.toLowerCase();

    const filtered = reports.filter(
      (report) =>
        report.title.toLowerCase().includes(value) ||
        report.category.toLowerCase().includes(value) ||
        report.reporter.full_name.toLowerCase().includes(value) ||
        report.reporter.email.toLowerCase().includes(value)
    );

    setFilteredReports(filtered);
  }, [search, reports]);

  function getSeverity(report: Report) {
    if (!report.predictions || report.predictions.length === 0) {
      return "Pending";
    }

    return report.predictions[0].predicted_severity;
  }

  function severityClass(severity: string) {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
  <CompanyLayout title="Company Reports">
      <div className="min-h-screen bg-gray-50 p-8">

        {/* Header */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vulnerability Reports
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Reports submitted by your company employees
            </p>
          </div>

        </div>

        {/* Search */}

        <div className="mb-6">

          <div className="relative w-96">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />

          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading ? (
          <div className="rounded-lg border bg-white p-10 text-center text-gray-500">
            Loading reports...
          </div>
        ) : (

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

            {filteredReports.length === 0 ? (

              <div className="p-12 text-center">

                <h3 className="font-semibold text-gray-800">
                  No reports found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {reports.length === 0
                    ? "Your employees have not submitted any vulnerability reports yet."
                    : "No reports match your search."}
                </p>

              </div>

            ) : (

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b bg-gray-50 text-left">

                    <th className="px-5 py-3 font-semibold">
                      Report
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Reporter
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Category
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Severity
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Submitted
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredReports.map((report) => {

                    const severity = getSeverity(report);

                    return (

                      <tr
  key={report.id}
  onClick={() => navigate(`/company/reports/${report.id}`)}
  className="cursor-pointer border-b last:border-0 hover:bg-gray-50"
>

                        {/* Report */}

                        <td className="px-5 py-4">

                          <Link
  to={`/company/reports/${report.id}`}
  className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
>
  {report.title}
</Link>

                          <div className="mt-1 text-xs text-gray-400">
                            #{report.id.toString().padStart(4, "0")}
                          </div>

                        </td>

                        {/* Reporter */}

                        <td className="px-5 py-4">

                          <div className="font-medium text-gray-800">
                            {report.reporter.full_name}
                          </div>

                          <div className="text-xs text-gray-500">
                            {report.reporter.email}
                          </div>

                        </td>

                        {/* Category */}

                        <td className="px-5 py-4 text-gray-600">
                          {report.category}
                        </td>

                        {/* Severity */}

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${severityClass(
                              severity
                            )}`}
                          >
                            {severity}
                          </span>

                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              report.status.is_terminal
                                ? "bg-gray-100 text-gray-600"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {report.status.name}
                          </span>

                        </td>

                        {/* Date */}

                        <td className="px-5 py-4 text-gray-500">

                          {new Date(
                            report.submission_date
                          ).toLocaleDateString()}

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            )}

          </div>

        )}

      </div>
    </CompanyLayout>
  );
}