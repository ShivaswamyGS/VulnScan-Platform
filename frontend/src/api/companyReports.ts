import { companyApiClient } from "./companyClient";

export interface CompanyReport {
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

  reporter: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
    department: string | null;
    designation: string | null;
    employee_id: string | null;
    created_at: string;
  };

  status: {
    id: number;
    name: string;
    description: string | null;
    is_terminal: boolean;
    sort_order: number;
  };

  predictions: {
    id: number;
    report_id: number;
    predicted_severity: "critical" | "high" | "medium" | "low";
    confidence_score: number;
    explanation: string | null;
    model_version: string;
    created_at: string;
  }[];
}

export async function getCompanyReports(): Promise<CompanyReport[]> {
  const { data } = await companyApiClient.get<CompanyReport[]>(
    "/company/reports/"
  );

  return data;
}

export async function getCompanyReport(
  id: number
): Promise<CompanyReport> {
  const { data } = await companyApiClient.get<CompanyReport[]>(
    "/company/reports/"
  );

  const report = data.find((item) => item.id === id);

  if (!report) {
    throw new Error("Report not found");
  }

  return report;
}

export interface CompanyReportUpdateInput {
  status_id?: number;
  priority?: number | null;
}


export async function updateCompanyReport(
  reportId: number,
  input: CompanyReportUpdateInput
): Promise<CompanyReport> {
  const { data } = await companyApiClient.put<CompanyReport>(
    `/company/reports/${reportId}`,
    input
  );

  return data;
}