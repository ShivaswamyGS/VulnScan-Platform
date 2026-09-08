import { apiClient } from "./client";
import { companyApiClient } from "./companyClient";

// =========================================================
// TYPES
// =========================================================

export interface Program {
  id: number;
  company_id?: number;

  program_name: string;
  description?: string | null;
  target_website: string;

  scope?: string | null;
  out_of_scope?: string | null;

  reward_min?: number | null;
  reward_max?: number | null;

  severity_reward_matrix?: string | null;
  program_rules?: string | null;
  submission_guidelines?: string | null;

  start_date?: string;
  end_date?: string | null;

  status: string;
  visibility: string;

  attachments?: string | null;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
}

// =========================================================
// RESEARCHER / PUBLIC
// =========================================================

// GET /programs/
// List public active Bug Bounty Programs
export async function getPrograms(): Promise<Program[]> {
  const response = await apiClient.get<Program[]>(
    "/programs/"
  );

  return response.data;
}

// GET /programs/{id}
// View public Bug Bounty Program
export async function getProgramById(
  id: number
): Promise<Program> {
  const response = await apiClient.get<Program>(
    `/programs/${id}`
  );

  return response.data;
}

// =========================================================
// COMPANY
// IMPORTANT:
// Company endpoints MUST use companyApiClient
// so the company_access_token is sent.
// =========================================================

// GET /company/programs/company
// List programs belonging to authenticated company
export async function getCompanyPrograms(): Promise<Program[]> {
  const response =
    await companyApiClient.get<Program[]>(
      "/company/programs/company"
    );

  return response.data;
}

// GET /company/programs/{id}
// Get a company-owned program
export async function getCompanyProgramById(
  id: number
): Promise<Program> {
  const response =
    await companyApiClient.get<Program>(
      `/company/programs/${id}`
    );

  return response.data;
}

// POST /company/programs/
// Create a company Bug Bounty Program
export async function createProgram(
  data: Omit<
    Program,
    "id" | "created_at" | "updated_at"
  >
): Promise<Program> {
  const response =
    await companyApiClient.post<Program>(
      "/company/programs/",
      data
    );

  return response.data;
}

// PUT /company/programs/{id}
// Update a company Bug Bounty Program
export async function updateProgram(
  id: number,
  data: Partial<Program>
): Promise<Program> {
  const response =
    await companyApiClient.put<Program>(
      `/company/programs/${id}`,
      data
    );

  return response.data;
}

// DELETE /company/programs/{id}
// Delete a company Bug Bounty Program
export async function deleteProgram(
  id: number
): Promise<void> {
  await companyApiClient.delete(
    `/company/programs/${id}`
  );
}