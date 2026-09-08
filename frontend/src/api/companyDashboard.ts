import { companyApiClient } from "./companyClient";
import type { DashboardStats } from "../types";

export async function getCompanyDashboardStats(): Promise<DashboardStats> {
  const { data } = await companyApiClient.get<DashboardStats>(
    "/company/dashboard"
  );

  return data;
}