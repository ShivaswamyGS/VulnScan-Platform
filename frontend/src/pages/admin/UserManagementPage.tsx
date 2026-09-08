import { useEffect, useState } from "react";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  activateUser,
  changeUserRole,
  deactivateUser,
  getUsers,
  type AdminUser,
} from "../../api/users";

import { getErrorMessage } from "../../api/client";


export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);


  async function loadUsers() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getUsers(
        roleFilter || undefined
      );

      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    loadUsers();
  }, [roleFilter]);


  async function handleToggleUser(user: AdminUser) {
    try {
      setActionLoading(user.id);
      setError(null);

      if (user.is_active) {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }

      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }


  async function handleRoleChange(
    user: AdminUser,
    role: string
  ) {
    if (!role || role === user.role) {
      return;
    }

    try {
      setActionLoading(user.id);
      setError(null);

      await changeUserRole(
        user.id,
        role
      );

      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }


  function getRoleClass(role: string) {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-700";

      case "internal_tester":
        return "bg-blue-100 text-blue-700";

      case "company":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }


  return (
    <AppLayout title="User Management">

      {error && (
        <div className="mb-5">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}


      <Card className="overflow-hidden">

        {/* Header */}

        <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-base font-semibold text-[var(--color-ink)]">
              User Management
            </h2>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Manage registered users, account status,
              and roles.
            </p>
          </div>


          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">
              All Roles
            </option>

            <option value="admin">
              Administrator
            </option>

            <option value="internal_tester">
              Internal Tester
            </option>

            <option value="company">
              Company
            </option>
          </select>

        </div>


        {/* Loading */}

        {isLoading ? (
          <div className="p-10 text-center">
            <p className="text-sm text-[var(--color-ink-muted)]">
              Loading users...
            </p>
          </div>

        ) : users.length === 0 ? (

          <div className="p-10 text-center">
            <h3 className="text-sm font-semibold">
              No Users Found
            </h3>

            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              No users match the selected filter.
            </p>
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b bg-gray-50">

                  <th className="px-5 py-3 text-left font-medium">
                    User
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Department
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Created
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Action
                  </th>

                </tr>
              </thead>


              <tbody>

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >

                    {/* User */}

                    <td className="px-5 py-4">

                      <div>
                        <p className="font-medium text-[var(--color-ink)]">
                          {user.full_name}
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                          {user.email}
                        </p>

                        {user.employee_id && (
                          <p className="mt-1 font-mono text-xs text-gray-400">
                            ID: {user.employee_id}
                          </p>
                        )}
                      </div>

                    </td>


                    {/* Role */}

                    <td className="px-5 py-4">

                      <select
                        value={user.role}
                        disabled={
                          actionLoading === user.id
                        }
                        onChange={(event) =>
                          handleRoleChange(
                            user,
                            event.target.value
                          )
                        }
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${getRoleClass(
                          user.role
                        )}`}
                      >

                        <option value="admin">
                          Admin
                        </option>

                        <option value="internal_tester">
                          Internal Tester
                        </option>

                        <option value="company">
                          Company
                        </option>

                      </select>

                    </td>


                    {/* Department */}

                    <td className="px-5 py-4">

                      <div>
                        <p>
                          {user.department || "-"}
                        </p>

                        {user.designation && (
                          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                            {user.designation}
                          </p>
                        )}
                      </div>

                    </td>


                    {/* Status */}

                    <td className="px-5 py-4">

                      {user.is_active ? (

                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>

                      ) : (

                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                          Inactive
                        </span>

                      )}

                    </td>


                    {/* Created */}

                    <td className="px-5 py-4 text-xs text-[var(--color-ink-muted)]">

                      {new Date(
                        user.created_at
                      ).toLocaleDateString()}

                    </td>


                    {/* Action */}

                    <td className="px-5 py-4">

                      <button
                        type="button"
                        disabled={
                          actionLoading === user.id
                        }
                        onClick={() =>
                          handleToggleUser(user)
                        }
                        className={`rounded-md px-3 py-2 text-xs font-medium text-white disabled:opacity-50 ${
                          user.is_active
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >

                        {actionLoading === user.id
                          ? "Updating..."
                          : user.is_active
                            ? "Deactivate"
                            : "Activate"}

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </Card>

    </AppLayout>
  );
}