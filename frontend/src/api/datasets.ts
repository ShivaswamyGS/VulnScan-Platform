import { apiClient } from "./client";

export interface TrainingDataset {
  id: number;
  name: string;
  file_path: string;
  dataset_type: string;
  record_count: number;
  validation_status: string;
  validation_message: string | null;
  is_active: boolean;
  uploaded_at: string;
  updated_at: string;
}

// =========================================================
// LIST DATASETS
// =========================================================

export async function getDatasets(): Promise<TrainingDataset[]> {
  const response = await apiClient.get<TrainingDataset[]>(
    "/admin/datasets"
  );

  return response.data;
}

// =========================================================
// UPLOAD DATASET
// =========================================================

export async function uploadDataset(
  file: File
): Promise<TrainingDataset> {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const response = await apiClient.post<TrainingDataset>(
    "/admin/datasets/upload",
    formData
  );

  return response.data;
}

// =========================================================
// GET DATASET BY ID
// =========================================================

export async function getDatasetById(
  datasetId: number
): Promise<TrainingDataset> {
  const response = await apiClient.get<TrainingDataset>(
    `/admin/datasets/${datasetId}`
  );

  return response.data;
}

// =========================================================
// ACTIVATE DATASET
// =========================================================

export async function activateDataset(
  datasetId: number
): Promise<TrainingDataset> {
  const response = await apiClient.post<TrainingDataset>(
    `/admin/datasets/${datasetId}/activate`
  );

  return response.data;
}

// =========================================================
// GET ACTIVE DATASET
// =========================================================

export async function getActiveDataset(): Promise<TrainingDataset> {
  const response = await apiClient.get<TrainingDataset>(
    "/admin/datasets/active/current"
  );

  return response.data;
}

// =========================================================
// DELETE DATASET
// =========================================================

export async function deleteDataset(
  datasetId: number
): Promise<void> {
  await apiClient.delete(
    `/admin/datasets/${datasetId}`
  );
}