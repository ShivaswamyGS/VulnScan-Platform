import { apiClient } from "./client";

export interface DuplicateReport {
  report_id: number;
  title: string;
  category: string;
  similarity_score: number;
  is_duplicate: boolean;
}

export interface DuplicateReportsResponse {
  report_id: number;
  threshold: number;
  duplicate_count: number;
  duplicates: DuplicateReport[];
}

export async function getDuplicateReports(
  reportId: number,
  threshold: number = 0.75
): Promise<DuplicateReportsResponse> {
  const response =
    await apiClient.get<DuplicateReportsResponse>(
      `/reports/${reportId}/duplicates`,
      {
        params: {
          threshold,
        },
      }
    );

  return response.data;
}