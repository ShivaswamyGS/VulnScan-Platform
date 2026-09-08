import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  EmployeeForm,
  type EmployeeFormData,
} from "./EmployeeForm";

import {
  createEmployee,
  updateEmployee,
} from "../../api/employees";

import type { Employee } from "../../types";

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: Employee | null;
}

export function EmployeeModal({
  open,
  onClose,
  onSuccess,
  employee,
}: EmployeeModalProps) {
  const [loading, setLoading] =
    useState(false);

  const isEditing = !!employee;

  const [initialData, setInitialData] =
    useState<Partial<EmployeeFormData>>({});

  useEffect(() => {
    if (employee) {
      setInitialData({
        full_name: employee.full_name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        employee_id: employee.employee_id,
      });
    } else {
      setInitialData({});
    }
  }, [employee]);

  if (!open) return null;

  async function handleSubmit(
    data: EmployeeFormData
  ) {
    try {
      setLoading(true);

      if (employee) {
        await updateEmployee(
          employee.id,
          {
            full_name: data.full_name,
            department: data.department,
            designation: data.designation,
          }
        );
      } else {
        await createEmployee(data);
      }

      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      alert(
        isEditing
          ? "Failed to update employee"
          : "Failed to create employee"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b p-5">

          <h2 className="text-xl font-semibold">
            {isEditing
              ? "Edit Employee"
              : "Add Employee"}
          </h2>

          <button
            onClick={onClose}
            className="rounded p-2 hover:bg-gray-100"
          >
            <X size={18} />
          </button>

        </div>


        {/* Form */}

        <div className="p-6">

          <EmployeeForm
  isLoading={loading}
  onSubmit={handleSubmit}
  initialValues={initialData}
  isEditing={isEditing}
/>

        </div>

      </div>

    </div>
  );
}