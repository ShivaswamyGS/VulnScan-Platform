import { useEffect, useState } from "react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  getAuditLogs,
  type AuditLog,
} from "../../api/auditLogs";

import { getErrorMessage } from "../../api/client";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getAuditLogs({
        limit: 100,
      });

      setLogs(data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFilter() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getAuditLogs({
        user_id: userId ? Number(userId) : undefined,
        action: action || undefined,
        entity_type: entityType || undefined,
        limit: 100,
      });

      setLogs(data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClear() {
    setUserId("");
    setAction("");
    setEntityType("");

    await loadLogs();
  }

  function getActionClass(action: string) {
    const value = action?.toLowerCase();

    if (
      value.includes("delete") ||
      value.includes("reject")
    ) {
      return "bg-red-100 text-red-700";
    }

    if (
      value.includes("approve") ||
      value.includes("accept") ||
      value.includes("resolve")
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      value.includes("update") ||
      value.includes("review")
    ) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  return (
    <AppLayout title="Audit Logs">

      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">
          Security Audit Trail
        </h2>

        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Monitor security-sensitive actions performed across
          the platform.
        </p>
      </div>

      {error && (
        <div className="mb-5">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}

      <Card className="mb-5 p-5">
        <div className="grid gap-4 md:grid-cols-4">

          <div>
            <label
              htmlFor="userId"
              className="mb-2 block text-sm font-medium"
            >
              User ID
            </label>

            <input
              id="userId"
              type="number"
              value={userId}
              onChange={(event) =>
                setUserId(event.target.value)
              }
              placeholder="e.g. 12"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="action"
              className="mb-2 block text-sm font-medium"
            >
              Action
            </label>

            <input
              id="action"
              type="text"
              value={action}
              onChange={(event) =>
                setAction(event.target.value)
              }
              placeholder="e.g. update"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="entityType"
              className="mb-2 block text-sm font-medium"
            >
              Entity Type
            </label>

            <input
              id="entityType"
              type="text"
              value={entityType}
              onChange={(event) =>
                setEntityType(event.target.value)
              }
              placeholder="e.g. submission"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex items-end gap-2">

            <button
              type="button"
              onClick={handleFilter}
              disabled={isLoading}
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Filter
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Clear
            </button>

          </div>
        </div>
      </Card>

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
            No audit events match the selected filters.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">

          <div className="border-b p-5">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              Audit Events
            </h3>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Showing {logs.length} audit event
              {logs.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-sm">

              <thead>
                <tr className="border-b bg-gray-50">

                  <th className="px-5 py-3 text-left font-medium">
                    Time
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
                    Entity ID
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Details
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    IP Address
                  </th>

                </tr>
              </thead>

              <tbody>

                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-ink-muted)]">
                      {log.created_at
                        ? new Date(
                            log.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      {log.user_id ?? "System"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getActionClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {log.entity_type || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {log.entity_id ?? "-"}
                    </td>

                    <td className="max-w-md px-5 py-4">
                      <p className="whitespace-pre-wrap break-words text-xs text-[var(--color-ink-muted)]">
                        {log.details || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--color-ink-muted)]">
                      {log.ip_address || "-"}
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