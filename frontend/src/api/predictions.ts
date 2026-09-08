import { apiClient } from "./client";

export interface Prediction {
  id: number;
  report_id: number;
  predicted_severity: string;
  confidence_score: number;
  explanation?: string | null;
  model_version?: string | null;
  created_at?: string;
}

export async function getPredictionHistory(
  reportId: number
): Promise<Prediction[]> {
  const response = await apiClient.get<Prediction[]>(
    `/predictions/${reportId}/history`
  );

  return response.data;
}

export async function rerunPrediction(
  reportId: number
): Promise<Prediction> {
  const response = await apiClient.post<Prediction>(
    `/predictions/${reportId}/rerun`
  );

  return response.data;
}