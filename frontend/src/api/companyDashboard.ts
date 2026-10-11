import { companyApiClient } from "./companyClient";

export interface CompanyRecentSubmission {
  id: number;
  title: string;
  vulnerability_type: string;
  affected_asset: string;
  severity: string | null;
  status: string;
  submitted_at: string;
  program_id: number;
}

export interface CompanyDashboardStats {
  total_reports: number;

  critical_reports: number;
  high_reports: number;
  medium_reports: number;
  low_reports: number;

  open_reports: number;
  resolved_reports: number;

  severity_distribution: Record<string, number>;
  status_distribution: Record<string, number>;

  recent_reports: CompanyRecentSubmission[];
}

export async function getCompanyDashboardStats(): Promise<CompanyDashboardStats> {
  const { data } =
    await companyApiClient.get<CompanyDashboardStats>(
      "/company/dashboard"
    );

  return data;
}