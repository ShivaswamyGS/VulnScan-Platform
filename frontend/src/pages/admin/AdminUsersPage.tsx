import { useEffect, useState } from "react";
import { RefreshCw, UserCheck, UserX } from "lucide-react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  getUsers,
  activateUser,
  deactivateUser,
  changeUserRole,
  type AdminUser,
} from "../../api/users";

import { getErrorMessage } from "../../api/client";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function loadUsers() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getUsers(
        selectedRole || undefined
      );

      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

  async function handleToggleStatus(user: AdminUser) {
    const action = user.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `${action === "deactivate" ? "Deactivate" : "Activate"} "${user.full_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(user.id);
      setError(null);

      if (user.is_active) {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }

      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRoleChange(
    user: AdminUser,
    newRole: string
  ) {
    if (!newRole || newRole === user.role) {
      return;
    }

    const confirmed = window.confirm(
      `Change "${user.full_name}" role from "${user.role}" to "${newRole}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(user.id);
      setError(null);

      await changeUserRole(user.id, newRole);

      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AppLayout title="User Management">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
              User Management
            </h1>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Manage internal testers and administrators.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={isLoading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label
              htmlFor="role-filter"
              className="text-sm font-medium text-[var(--color-ink)]"
            >
              Filter by role
            </label>

            <select
              id="role-filter"
              value={selectedRole}
              onChange={(event) =>
                setSelectedRole(event.target.value)
              }
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="">All users</option>
              <option value="admin">Administrators</option>
              <option value="internal_tester">
                Internal Testers
              </option>
            </select>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Loading */}
        {isLoading && (
          <Card className="p-6">
            <p className="text-sm text-[var(--color-ink-muted)]">
              Loading users...
            </p>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && users.length === 0 && !error && (
          <Card className="p-10 text-center">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              No users found
            </h2>

            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              There are no users matching the selected filter.
            </p>
          </Card>
        )}

        {/* Users */}
        {!isLoading && users.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Role
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Company
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Department
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Designation
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {users.map((user) => {
                    const isProcessing =
                      processingId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50"
                      >
                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-[var(--color-ink)]">
                            {user.full_name}
                          </div>

                          <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                            {user.email}
                          </div>

                          {user.employee_id && (
                            <div className="mt-1 text-xs text-gray-400">
                              Employee ID: {user.employee_id}
                            </div>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <select
                            value={user.role}
                            disabled={isProcessing}
                            onChange={(event) =>
                              handleRoleChange(
                                user,
                                event.target.value
                              )
                            }
                            className="rounded-md border px-2 py-1.5 text-sm"
                          >
                            <option value="admin">
                              Admin
                            </option>

                            <option value="internal_tester">
                              Internal Tester
                            </option>
                          </select>
                        </td>

                        {/* Company */}
                        <td className="px-5 py-4 text-sm">
                          {user.company_id ?? "—"}
                        </td>

                        {/* Department */}
                        <td className="px-5 py-4 text-sm">
                          {user.department || "—"}
                        </td>

                        {/* Designation */}
                        <td className="px-5 py-4 text-sm">
                          {user.designation || "—"}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                              <UserCheck size={13} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                              <UserX size={13} />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              handleToggleStatus(user)
                            }
                            className={
                              user.is_active
                                ? "rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                                : "rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                            }
                          >
                            {isProcessing
                              ? "Processing..."
                              : user.is_active
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}