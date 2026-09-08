import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

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
  created_at?: string;
}

export interface CompanyActionResponse {
  message: string;
  company_id: number;
  approval_status: string;
  approval_reason?: string | null;
  approved_at?: string | null;
}

/**
 * Get all companies waiting for admin approval.
 */
export const getPendingCompanies = async (): Promise<PendingCompany[]> => {
  const response = await axios.get<PendingCompany[]>(
    `${API_BASE_URL}/admin/companies/pending`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

/**
 * Approve a pending company.
 */
export const approveCompany = async (
  companyId: number
): Promise<CompanyActionResponse> => {
  const response = await axios.post<CompanyActionResponse>(
    `${API_BASE_URL}/admin/companies/${companyId}/approve`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

/**
 * Reject a pending company.
 */
export const rejectCompany = async (
  companyId: number,
  reason?: string
): Promise<CompanyActionResponse> => {
  const response = await axios.post<CompanyActionResponse>(
    `${API_BASE_URL}/admin/companies/${companyId}/reject`,
    null,
    {
      params: reason ? { reason } : {},
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};