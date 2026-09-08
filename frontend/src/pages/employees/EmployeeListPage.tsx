import { useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-react";

import CompanyLayout from "../../components/company/CompanyLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";

import { EmployeeModal } from "../../components/employees/EmployeeModal";

import {
  getEmployees,
  deleteEmployee,
} from "../../api/employees";

import { getErrorMessage } from "../../api/client";

import type { Employee } from "../../types";

export function EmployeeListPage() {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [filtered, setFiltered] =
    useState<Employee[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [openModal, setOpenModal] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError(null);

      const data = await getEmployees();

      setEmployees(data);
      setFiltered(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const value = search.toLowerCase();

    let result = employees.filter(
      (employee) =>
        employee.full_name
          .toLowerCase()
          .includes(value) ||
        employee.email
          .toLowerCase()
          .includes(value) ||
        employee.department
          .toLowerCase()
          .includes(value) ||
        employee.designation
          .toLowerCase()
          .includes(value)
    );

    if (statusFilter === "Active") {
      result = result.filter(
        (employee) =>
          employee.is_active
      );
    }

    if (statusFilter === "Inactive") {
      result = result.filter(
        (employee) =>
          !employee.is_active
      );
    }

    setFiltered(result);
  }, [
    search,
    statusFilter,
    employees,
  ]);

  async function handleDelete(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Delete this employee?"
      );

    if (!confirmed) return;

    try {
      await deleteEmployee(id);

      await loadEmployees();
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  }

  const totalEmployees =
    employees.length;

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.is_active
    ).length;

  const inactiveEmployees =
    employees.filter(
      (employee) =>
        !employee.is_active
    ).length;

  return (
    <CompanyLayout title="Employees">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Employees
          </h1>

          <p className="text-gray-500 mt-1">
            Manage employees and internal testers
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedEmployee(null);
            setOpenModal(true);
          }}
        >
          <UserPlus size={16} />
          Add Employee
        </Button>

      </div>


      {/* Statistics */}

      <div className="grid grid-cols-3 gap-5 mb-6">

        <div className="border rounded-xl p-5 shadow-sm bg-white">

          <p className="text-sm text-gray-500">
            Total Employees
          </p>

          <p className="text-3xl font-bold mt-2">
            {totalEmployees}
          </p>

        </div>


        <div className="border rounded-xl p-5 shadow-sm bg-white">

          <p className="text-sm text-gray-500">
            Active
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {activeEmployees}
          </p>

        </div>


        <div className="border rounded-xl p-5 shadow-sm bg-white">

          <p className="text-sm text-gray-500">
            Inactive
          </p>

          <p className="text-3xl font-bold text-red-600 mt-2">
            {inactiveEmployees}
          </p>

        </div>

      </div>


      {/* Search + Filter */}

      <div className="flex gap-4 items-center mb-5">

        <div className="relative w-80">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            className="w-full rounded-lg border px-10 py-2"
            placeholder="Search employees..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="border rounded-lg px-4 py-2"
        >
          <option value="All">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>

        </select>

      </div>


      {/* Error */}

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}


      {/* Employee Table */}

      <Card>

        {loading ? (

          <div className="p-8 text-center">
            Loading employees...
          </div>

        ) : filtered.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No employees found.
          </div>

        ) : (

          <table className="w-full text-sm">

            <thead>

              <tr className="border-b bg-gray-50">

                <th className="px-5 py-3 text-left">
                  Name
                </th>

                <th className="text-left">
                  Email
                </th>

                <th className="text-left">
                  Department
                </th>

                <th className="text-left">
                  Designation
                </th>

                <th className="text-left">
                  Status
                </th>

                <th className="text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.map(
                (employee) => (

                  <tr
                    key={employee.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-5 py-3 font-medium">
                      {employee.full_name}
                    </td>

                    <td>
                      {employee.email}
                    </td>

                    <td>
                      {employee.department}
                    </td>

                    <td>
                      {employee.designation}
                    </td>

                    <td>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          employee.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {employee.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td>

                      <button
                        onClick={() => {
                          setSelectedEmployee(
                            employee
                          );

                          setOpenModal(
                            true
                          );
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                        title="Edit employee"
                      >
                        <Pencil
                          size={17}
                        />
                      </button>


                      <button
                        onClick={() =>
                          handleDelete(
                            employee.id
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                        title="Delete employee"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </Card>


      {/* Employee Modal */}

      <EmployeeModal
        open={openModal}
        employee={
          selectedEmployee
        }
        onClose={() => {
          setOpenModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={loadEmployees}
      />

    </CompanyLayout>
  );
}