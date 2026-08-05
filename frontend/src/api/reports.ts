import { apiClient } from "./client";
import type { Report, ReportCreateInput, ReportListItem } from "../types";

export interface ReportFilters {
  status_id?: number;
  category?: string;
  search?: string;
}

export async function submitReport(input: ReportCreateInput): Promise<Report> {
  const form = new FormData();
  form.set("title", input.title);
  form.set("description", input.description);
  form.set("affected_module", input.affected_module);
  form.set("category", input.category);
  form.set("steps_to_reproduce", input.steps_to_reproduce);
  form.set("expected_result", input.expected_result);
  form.set("actual_result", input.actual_result);
  if (input.attachment) {
    form.set("attachment", input.attachment);
  }

  const { data } = await apiClient.post<Report>("/reports", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getReports(filters: ReportFilters = {}): Promise<ReportListItem[]> {
  const { data } = await apiClient.get<ReportListItem[]>("/reports", { params: filters });
  return data;
}

export async function getReport(id: number): Promise<Report> {
  const { data } = await apiClient.get<Report>(`/reports/${id}`);
  return data;
}

/**
 * Attachments are served through an authenticated endpoint (not a plain
 * static URL), so a normal <a href> can't carry the JWT. We fetch the
 * bytes via axios (which does attach the auth header) and trigger the
 * browser's save dialog manually via a temporary object URL.
 */
export async function downloadAttachment(reportId: number, filename: string): Promise<void> {
  const response = await apiClient.get(`/reports/${reportId}/attachment`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
