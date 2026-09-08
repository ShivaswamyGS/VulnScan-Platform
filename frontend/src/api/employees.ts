import { companyApiClient } from "./companyClient";
import type { Employee } from "../types";

export interface CreateEmployeeInput {
  full_name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  employee_id: string;
}

export interface UpdateEmployeeInput {
  full_name?: string;
  department?: string;
  designation?: string;
  is_active?: boolean;
}

export async function getEmployees(): Promise<Employee[]> {
  const { data } = await companyApiClient.get<Employee[]>(
    "/company/employees/"
  );

  return data;
}

export async function createEmployee(
  input: CreateEmployeeInput
): Promise<Employee> {
  const { data } = await companyApiClient.post<Employee>(
    "/company/employees/",
    {
      ...input,
      role: "internal_tester",
    }
  );

  return data;
}

export async function updateEmployee(
  id: number,
  input: UpdateEmployeeInput
): Promise<Employee> {
  const { data } = await companyApiClient.put<Employee>(
    `/company/employees/${id}`,
    input
  );

  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await companyApiClient.delete(
    `/company/employees/${id}`
  );
}