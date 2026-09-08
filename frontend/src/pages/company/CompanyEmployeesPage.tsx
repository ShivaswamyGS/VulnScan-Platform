import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  Pencil,
  Trash2,
  X,
  UserPlus,
  RefreshCw,
} from "lucide-react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
} from "../../api/company";


// =========================================================
// TYPES
// =========================================================

interface EmployeeForm {
  full_name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  employee_id: string;
}


// =========================================================
// EMPTY FORM
// =========================================================

const emptyForm: EmployeeForm = {
  full_name: "",
  email: "",
  password: "",
  department: "",
  designation: "",
  employee_id: "",
};


// =========================================================
// COMPONENT
// =========================================================

export default function CompanyEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [form, setForm] =
    useState<EmployeeForm>(emptyForm);


  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();

      setEmployees(data);
    } catch (err: any) {
      console.error("Failed to load employees:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load employees."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadEmployees();
  }, []);


  // =========================================================
  // SEARCH
  // =========================================================

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) =>
      [
        employee.full_name,
        employee.email,
        employee.department,
        employee.designation,
        employee.employee_id,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        )
    );
  }, [employees, search]);


  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };


  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);

    setForm({
      full_name: employee.full_name,
      email: employee.email,
      password: "",
      department: employee.department,
      designation: employee.designation,
      employee_id: employee.employee_id,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  };


  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      if (editingEmployee) {
        await updateEmployee(
          editingEmployee.id,
          {
            full_name: form.full_name,
            department: form.department,
            designation: form.designation,
          }
        );

        setSuccess(
          "Employee updated successfully."
        );
      }

      // -----------------------------------------------------
      // CREATE
      // -----------------------------------------------------

      else {
        if (!form.password) {
          setError(
            "Password is required when creating an employee."
          );

          setSaving(false);
          return;
        }

        await createEmployee({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          department: form.department,
          designation: form.designation,
          employee_id: form.employee_id,

          // Backend also forces this role.
          role: "internal_tester",
        });

        setSuccess(
          "Employee created successfully."
        );
      }

      await loadEmployees();

      setShowModal(false);
      setEditingEmployee(null);
      setForm(emptyForm);

    } catch (err: any) {
      console.error(
        "Employee operation failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to save employee."
      );
    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    employee: Employee
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.full_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteEmployee(employee.id);

      setSuccess(
        "Employee deleted successfully."
      );

      await loadEmployees();

    } catch (err: any) {
      console.error(
        "Failed to delete employee:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to delete employee."
      );
    }
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-full bg-slate-50 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Employees
              </h1>

              <p className="text-sm text-slate-500">
                Manage your company's internal security testers.
              </p>
            </div>

          </div>
        </div>


        <div className="flex gap-2">

          <button
            type="button"
            onClick={loadEmployees}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>


          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={17} />

            Add Employee
          </button>

        </div>

      </div>


      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}


      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}


      {/* =====================================================
          SEARCH + STATS
      ===================================================== */}

      <div className="mb-5 grid gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total Employees
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {employees.length}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Users size={20} />
            </div>

          </div>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {
                employees.filter(
                  (employee) =>
                    employee.is_active
                ).length
              }
            </p>
          </div>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Inactive
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-500">
              {
                employees.filter(
                  (employee) =>
                    !employee.is_active
                ).length
              }
            </p>
          </div>

        </div>

      </div>


      {/* =====================================================
          EMPLOYEE TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Search */}

        <div className="border-b border-slate-200 p-4">

          <div className="relative max-w-md">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search employees..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>


        {/* Loading */}

        {loading ? (

          <div className="flex items-center justify-center py-20">

            <RefreshCw
              size={25}
              className="animate-spin text-blue-600"
            />

            <span className="ml-3 text-sm text-slate-500">
              Loading employees...
            </span>

          </div>

        ) : filteredEmployees.length === 0 ? (

          /* Empty */

          <div className="flex flex-col items-center justify-center py-20">

            <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
              <UserPlus size={28} />
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              {search
                ? "No employees found"
                : "No employees yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search."
                : "Add your first internal security tester."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={17} />
                Add Employee
              </button>
            )}

          </div>

        ) : (

          /* Table */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employee ID
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Designation
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredEmployees.map(
                  (employee) => (

                    <tr
                      key={employee.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >

                      {/* Employee */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                            {employee.full_name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {employee.full_name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {employee.email}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* Employee ID */}

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {employee.employee_id}
                      </td>


                      {/* Department */}

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {employee.department}
                      </td>


                      {/* Designation */}

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {employee.designation}
                      </td>


                      {/* Status */}

                      <td className="px-5 py-4">

                        <span
                          className={
                            employee.is_active
                              ? "inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                              : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
                          }
                        >
                          {employee.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>


                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                employee
                              )
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit employee"
                          >
                            <Pencil size={16} />
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                employee
                              )
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
                            title="Delete employee"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingEmployee
                    ? "Update employee information."
                    : "Create an internal security tester account."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* Full Name */}

                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={150}
                    placeholder="Enter employee name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Email */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={!!editingEmployee}
                    placeholder="employee@company.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none disabled:bg-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Password */}

                {!editingEmployee && (

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                )}


                {/* Employee ID */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Employee ID
                  </label>

                  <input
                    name="employee_id"
                    value={form.employee_id}
                    onChange={handleChange}
                    required
                    disabled={!!editingEmployee}
                    placeholder="EMP001"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none disabled:bg-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Department */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    placeholder="Cybersecurity"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Designation */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Designation
                  </label>

                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    required
                    placeholder="Security Analyst"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Role */}

              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">

                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Account Role
                </p>

                <p className="mt-1 text-sm text-blue-800">
                  Internal Tester
                </p>

                <p className="mt-1 text-xs text-blue-600">
                  Company-created employees are automatically assigned the Internal Tester role.
                </p>

              </div>


              {/* Modal Actions */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingEmployee
                    ? "Save Changes"
                    : "Create Employee"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}