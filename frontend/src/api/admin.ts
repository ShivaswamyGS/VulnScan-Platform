import { apiClient } from "./client";

// =========================================================
// ADMIN BUG BOUNTY PROGRAM
// =========================================================

export interface AdminProgram {
  id: number;
  company_id: number;

  program_name: string;
  description: string;
  target_website: string;

  scope: string;
  out_of_scope?: string | null;

  reward_min?: number | null;
  reward_max?: number | null;

  severity_reward_matrix?: string | null;

  program_rules: string;
  submission_guidelines: string;

  start_date: string;
  end_date?: string | null;

  status: string;
  visibility: string;

  attachments?: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

// GET /admin/programs
export async function getAdminPrograms(): Promise<AdminProgram[]> {
  const { data } = await apiClient.get<AdminProgram[]>(
    "/admin/programs"
  );

  return data;
}

// =========================================================
// PENDING COMPANIES
// =========================================================

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