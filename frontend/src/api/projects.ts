import { companyApiClient } from "./companyClient";

export interface CreateProjectInput {
  name: string;
  description?: string;
  repository_url?: string;
  status?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  repository_url?: string;
  status?: string;
}

export async function getProjects() {
  const { data } = await companyApiClient.get("/projects");
  return data;
}

export async function createProject(input: CreateProjectInput) {
  const { data } = await companyApiClient.post("/projects", input);
  return data;
}

export async function updateProject(
  id: number,
  input: UpdateProjectInput
) {
  const { data } = await companyApiClient.put(
    `/projects/${id}`,
    input
  );
  return data;
}

export async function deleteProject(id: number) {
  await companyApiClient.delete(`/projects/${id}`);
}