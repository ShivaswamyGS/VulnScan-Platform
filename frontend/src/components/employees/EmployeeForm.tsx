import { useEffect, useState } from "react";
import { Button } from "../ui/Button";

export interface EmployeeFormData {
  full_name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  employee_id: string;
}

interface EmployeeFormProps {
  initialValues?: Partial<EmployeeFormData>;
  isLoading?: boolean;
  isEditing?: boolean;
  onSubmit: (
    data: EmployeeFormData
  ) => Promise<void> | void;
}

const emptyForm: EmployeeFormData = {
  full_name: "",
  email: "",
  password: "",
  department: "",
  designation: "",
  employee_id: "",
};

export function EmployeeForm({
  initialValues = {},
  isLoading = false,
  isEditing = false,
  onSubmit,
}: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormData>({
    ...emptyForm,
    ...initialValues,
  });

  useEffect(() => {
    setForm({
      ...emptyForm,
      ...initialValues,
    });
  }, [initialValues]);

  function update<K extends keyof EmployeeFormData>(
    key: K,
    value: EmployeeFormData[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    await onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Full Name */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Full Name
        </label>

        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) =>
            update("full_name", e.target.value)
          }
          required
        />
      </div>

      {/* Email */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Email
        </label>

        <input
          className="w-full rounded-lg border px-3 py-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            update("email", e.target.value)
          }
          disabled={isEditing}
          required
        />

        {isEditing && (
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed here.
          </p>
        )}
      </div>

      {/* Password */}

      {!isEditing && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Password
          </label>

          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              update("password", e.target.value)
            }
            required
            minLength={8}
          />
        </div>
      )}

      {/* Department */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Department
        </label>

        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Department"
          value={form.department}
          onChange={(e) =>
            update("department", e.target.value)
          }
          required
        />
      </div>

      {/* Designation */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Designation
        </label>

        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Designation"
          value={form.designation}
          onChange={(e) =>
            update("designation", e.target.value)
          }
          required
        />
      </div>

      {/* Employee ID */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Employee ID
        </label>

        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Employee ID"
          value={form.employee_id}
          onChange={(e) =>
            update("employee_id", e.target.value)
          }
          disabled={isEditing}
          required
        />

        {isEditing && (
          <p className="mt-1 text-xs text-gray-500">
            Employee ID cannot be changed here.
          </p>
        )}
      </div>

      {/* Submit */}

      <div className="flex justify-end pt-3">
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {isEditing
            ? "Update Employee"
            : "Save Employee"}
        </Button>
      </div>
    </form>
  );
}