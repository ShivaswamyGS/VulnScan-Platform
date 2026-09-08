import { apiClient } from "./client";

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  company_id: number | null;
  department: string | null;
  designation: string | null;
  employee_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUsers(
  role?: string
): Promise<AdminUser[]> {
  const params = new URLSearchParams();

  if (role) {
    params.append("role", role);
  }

  const query = params.toString();

  const response = await apiClient.get<AdminUser[]>(
    `/users${query ? `?${query}` : ""}`
  );

  return response.data;
}

export async function getUser(
  userId: number
): Promise<AdminUser> {
  const response = await apiClient.get<AdminUser>(
    `/users/${userId}`
  );

  return response.data;
}

export async function activateUser(
  userId: number
) {
  const response = await apiClient.post(
    `/users/${userId}/activate`
  );

  return response.data;
}

export async function deactivateUser(
  userId: number
) {
  const response = await apiClient.post(
    `/users/${userId}/deactivate`
  );

  return response.data;
}

export async function changeUserRole(
  userId: number,
  role: string
) {
  const response = await apiClient.post(
    `/users/${userId}/role`,
    null,
    {
      params: {
        role,
      },
    }
  );

  return response.data;
}