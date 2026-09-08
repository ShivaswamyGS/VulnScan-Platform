export type Role = "internal_tester" | "admin";
export type Severity = "critical" | "high" | "medium" | "low";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  employee_id: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Status {
  id: number;
  name: string;
  description: string | null;
  is_terminal: boolean;
  sort_order: number;
}

export interface Prediction {
  id: number;
  report_id: number;
  predicted_severity: Severity;
  confidence_score: number;
  explanation: string | null;
  model_version: string;
  created_at: string;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  affected_module: string;
  category: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  priority: number | null;
  attachment_path: string | null;
  submission_date: string;
  updated_at: string;
  reporter: User;
  status: Status;
  predictions: Prediction[];
}

export interface ReportListItem {
  id: number;
  title: string;
  category: string;
  priority: number | null;
  submission_date: string;
  status: Status;
  latest_prediction: Prediction | null;
}

export interface ReportCreateInput {
  title: string;
  description: string;
  affected_module: string;
  category: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  attachment?: File | null;
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
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiErrorBody {
  detail?: string;
  errors?: unknown;
}
