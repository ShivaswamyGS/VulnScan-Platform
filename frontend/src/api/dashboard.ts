import { apiClient } from "./client";

export interface StatusRead {
  id: number;
  name: string;
}

export interface PredictionRead {
  id: number;
  prediction?: string | null;
  confidence?: number | null;
}

export interface ReportListItem {
  id: number;
  title: string;
  category: string;
  priority: number | null;
  submission_date: string;
  status: StatusRead;
  latest_prediction: PredictionRead | null;
}

export interface DashboardStats {
  total_reports: number;

  critical_reports: number;
  high_reports: number;
  medium_reports: number;
  low_reports: number;

  open_reports: number;
  resolved_reports: number;

  severity_distribution: Record<string, number>;
  status_distribution: Record<string, number>;

  recent_reports: ReportListItem[];

  critical_vulnerabilities: ReportListItem[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>(
    "/dashboard/stats"
  );

  return response.data;
}