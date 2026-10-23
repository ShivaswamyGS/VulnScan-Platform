import { apiClient } from "./client";

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  user_id?: number;
  action?: string;
  entity_type?: string;
  entity_id?: number;
  limit?: number;
}

export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLog[]> {
  const params = new URLSearchParams();

  if (filters.user_id !== undefined) {
    params.append("user_id", String(filters.user_id));
  }

  if (filters.action) {
    params.append("action", filters.action);
  }

  if (filters.entity_type) {
    params.append("entity_type", filters.entity_type);
  }

  if (filters.entity_id !== undefined) {
    params.append("entity_id", String(filters.entity_id));
  }

  if (filters.limit !== undefined) {
    params.append("limit", String(filters.limit));
  }

  const query = params.toString();

  const response = await apiClient.get<AuditLog[]>(
    `/audit-logs${query ? `?${query}` : ""}`
  );

  return response.data;
}