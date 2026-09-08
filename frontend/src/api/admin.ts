import { apiClient } from "./client";

export interface PendingCompany {
  id: number;
  company_name: string;
  email: string;
  website?: string | null;
  industry?: string | null;
  country?: string | null;
  phone?: string | null;
  approval_status: string;
  approval_reason?: string | null;
  created_at: string;
}

export async function getPendingCompanies(): Promise<PendingCompany[]> {
  const { data } = await apiClient.get<PendingCompany[]>(
    "/admin/companies/pending"
  );

  return data;
}

export async function approveCompany(id: number) {
  const { data } = await apiClient.post(
    `/admin/companies/${id}/approve`
  );

  return data;
}

export async function rejectCompany(
  id: number,
  reason?: string
) {
  const { data } = await apiClient.post(
    `/admin/companies/${id}/reject`,
    null,
    {
      params: reason ? { reason } : undefined,
    }
  );

  return data;
}