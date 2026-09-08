import { useEffect, useState } from "react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { apiClient, getErrorMessage } from "../../api/client";

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  details: string | Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  async function loadAuditLogs() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<AuditLog[]>(
        "/audit-logs"
      );

      setLogs(response.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function formatDetails(
    details: string | Record<string, unknown> | null
  ) {
    if (!details) {
      return "-";
    }

    if (typeof details === "string") {
      return details;
    }

    return JSON.stringify(details);
  }

  return (
    <AppLayout title="Audit Logs">
      {error && (
        <div className="mb-5">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}

      {isLoading ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Loading audit logs...
          </p>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-10 text-center">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">
            No Audit Logs
          </h3>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            No security audit events have been recorded yet.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b p-5">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">
              Security Audit Trail
            </h2>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Review security and administrative activity.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-5 py-3 text-left font-medium">
                    ID
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    User
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Action
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Entity
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Details
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    IP Address
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      #{log.id}
                    </td>

                    <td className="px-5 py-4">
                      {log.user_id ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {log.entity_type
                        ? `${log.entity_type}${
                            log.entity_id
                              ? ` #${log.entity_id}`
                              : ""
                          }`
                        : "-"}
                    </td>

                    <td className="max-w-md px-5 py-4">
                      <p className="truncate text-xs text-[var(--color-ink-muted)]">
                        {formatDetails(log.details)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {log.ip_address ?? "-"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-ink-muted)]">
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}