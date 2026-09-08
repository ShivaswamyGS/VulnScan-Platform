import { apiClient } from "./client";

export interface ResearcherProgram {
  id: number;
  company_id: number;

  program_name: string;
  description: string;
  target_website: string;

  scope: string;
  out_of_scope: string | null;

  reward_min: number | null;
  reward_max: number | null;

  severity_reward_matrix: string | null;

  program_rules: string;
  submission_guidelines: string;

  start_date: string;
  end_date: string | null;

  status: string;
  visibility: string;

  attachments: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

/**
 * Get active/public programs available to researchers.
 */
export async function getResearcherPrograms(): Promise<
  ResearcherProgram[]
> {
  const response =
    await apiClient.get<ResearcherProgram[]>(
      "/programs/"
    );

  return response.data;
}

/**
 * Get one researcher-visible program.
 */
export async function getResearcherProgramById(
  programId: number
): Promise<ResearcherProgram> {
  const response =
    await apiClient.get<ResearcherProgram>(
      `/programs/${programId}`
    );

  return response.data;
}