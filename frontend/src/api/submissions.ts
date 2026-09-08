import { apiClient } from "./client";

// =========================================================
// TYPES
// =========================================================

export interface SubmissionCreate {
  title: string;
  description: string;
  vulnerability_type: string;
  affected_asset: string;
  steps_to_reproduce: string;
  proof_of_concept?: string | null;
  impact: string;
  remediation?: string | null;
  attachment_path?: string | null;
}

export interface SubmissionUpdate {
  status?: string | null;
  severity?: string | null;
  bounty_amount?: number | null;
  reviewer_comment?: string | null;
}

export interface VulnerabilitySubmission {
  id: number;

  program_id: number;
  researcher_id: number;

  title: string;
  description: string;

  vulnerability_type: string;
  affected_asset: string;

  steps_to_reproduce: string;

  proof_of_concept?: string | null;

  impact: string;

  remediation?: string | null;

  severity?: string | null;

  status: string;

  bounty_amount?: number | null;

  attachment_path?: string | null;

  reviewer_comment?: string | null;

  submitted_at: string;
  updated_at: string;

  // Program information
  program?: {
    id: number;
    company_id: number;
    program_name: string;
    description?: string | null;
    target_website: string;
    scope?: string | null;
    out_of_scope?: string | null;
    reward_min?: number | null;
    reward_max?: number | null;
    severity_reward_matrix?: string | null;
    program_rules?: string;
    submission_guidelines?: string;
    start_date?: string;
    end_date?: string | null;
    status?: string;
    visibility?: string;
    attachments?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };

  // Researcher information
  researcher?: {
    id: number;
    full_name: string;
    email: string;
    role?: string;
  };
}

// =========================================================
// RESEARCHER
// CREATE SUBMISSION
// POST /submissions/programs/{program_id}
// =========================================================

export async function createSubmission(
  programId: number,
  data: SubmissionCreate
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.post<VulnerabilitySubmission>(
      `/submissions/programs/${programId}`,
      data
    );

  return response.data;
}

// =========================================================
// RESEARCHER
// GET MY SUBMISSIONS
// GET /submissions/mine
// =========================================================

export async function getMySubmissions(): Promise<
  VulnerabilitySubmission[]
> {
  const response =
    await apiClient.get<VulnerabilitySubmission[]>(
      "/submissions/mine"
    );

  return response.data;
}

// =========================================================
// RESEARCHER
// GET MY SUBMISSION
// GET /submissions/mine/{submission_id}
// =========================================================

export async function getMySubmissionById(
  submissionId: number
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.get<VulnerabilitySubmission>(
      `/submissions/mine/${submissionId}`
    );

  return response.data;
}

// =========================================================
// RESEARCHER
// DELETE MY SUBMISSION
// DELETE /submissions/mine/{submission_id}
// =========================================================

export async function deleteMySubmission(
  submissionId: number
): Promise<void> {
  await apiClient.delete(
    `/submissions/mine/${submissionId}`
  );
}

// =========================================================
// COMPANY
// GET ALL SUBMISSIONS
// GET /submissions/company
// =========================================================

export async function getCompanySubmissions(): Promise<
  VulnerabilitySubmission[]
> {
  const response =
    await apiClient.get<VulnerabilitySubmission[]>(
      "/submissions/company"
    );

  return response.data;
}

// =========================================================
// COMPANY
// GET SUBMISSION BY ID
// GET /submissions/company/{submission_id}
// =========================================================

export async function getCompanySubmissionById(
  submissionId: number
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.get<VulnerabilitySubmission>(
      `/submissions/company/${submissionId}`
    );

  return response.data;
}

// =========================================================
// COMPANY
// UPDATE / REVIEW SUBMISSION
// PUT /submissions/company/{submission_id}
// =========================================================

export async function updateCompanySubmission(
  submissionId: number,
  data: SubmissionUpdate
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.put<VulnerabilitySubmission>(
      `/submissions/company/${submissionId}`,
      data
    );

  return response.data;
}

// =========================================================
// ALIAS
// Keep reviewSubmission available if another page uses it.
// =========================================================

export async function reviewSubmission(
  submissionId: number,
  data: SubmissionUpdate
): Promise<VulnerabilitySubmission> {
  return updateCompanySubmission(
    submissionId,
    data
  );
}