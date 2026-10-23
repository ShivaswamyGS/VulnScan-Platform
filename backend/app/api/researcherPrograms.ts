import { apiClient } from "./client";

export interface ResearcherProgram {
  id: number;
  company_id: number;

  program_name: string;
  description: string;
  target_website: string;

  scope: string;
  out_of_scope?: string | null;

  reward_min?: number | null;
  reward_max?: number | null;

  severity_reward_matrix?: string | null;

  program_rules: string;
  submission_guidelines: string;

  start_date: string;
  end_date?: string | null;

  status: string;
  visibility: string;

  attachments?: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export async function getResearcherPrograms(): Promise<
  ResearcherProgram[]
> {
  const response = await apiClient.get<ResearcherProgram[]>(
    "/researcher/programs"
  );

  return response.data;
}

export async function getResearcherProgramById(
  programId: number
): Promise<ResearcherProgram> {
  const response = await apiClient.get<ResearcherProgram>(
    `/researcher/programs/${programId}`
  );

  return response.data;
}