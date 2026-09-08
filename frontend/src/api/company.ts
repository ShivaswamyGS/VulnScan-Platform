import { companyApiClient } from "./companyClient";

// =========================================================
// TYPES
// =========================================================

export interface CompanyAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CompanyProfile {
  id: number;
  company_name: string;
  email?: string | null;
  website?: string | null;
  industry?: string | null;
  country?: string | null;
  phone?: string | null;
  logo?: string | null;
  approval_status?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyUpdateInput {
  company_name: string;
  website?: string | null;
  industry?: string | null;
  country?: string | null;
  phone?: string | null;
  logo?: string | null;
}

export type ProgramStatus =
  | "draft"
  | "active"
  | "paused"
  | "closed";

export type ProgramVisibility =
  | "public"
  | "private";

export interface BugBountyProgram {
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
  status: ProgramStatus;
  visibility: ProgramVisibility;
  attachments?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =========================================================
// PROGRAM CREATE / UPDATE
// =========================================================

export interface ProgramCreate {
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
  status: ProgramStatus;
  visibility: ProgramVisibility;
  attachments?: string | null;
  is_active: boolean;
}

export type ProgramUpdate = Partial<ProgramCreate>;

// =========================================================
// COMPANY LOGIN
// =========================================================

export async function loginCompany(
  email: string,
  password: string
): Promise<CompanyAuthTokens> {
  const form = new URLSearchParams();

  form.set("username", email.trim());
  form.set("password", password);

  try {
    const response =
      await companyApiClient.post<CompanyAuthTokens>(
        "/company/login",
        form,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

    return response.data;
  } catch (error: any) {
    console.error(
      "Company login failed:",
      error?.response?.status,
      error?.response?.data
    );

    throw error;
  }
}

// =========================================================
// COMPANY REGISTER
// =========================================================

export async function registerCompany(
  data: Record<string, unknown>
): Promise<CompanyAuthTokens | CompanyProfile> {
  const response =
    await companyApiClient.post<
      CompanyAuthTokens | CompanyProfile
    >("/company/register", data);

  return response.data;
}

// =========================================================
// COMPANY PROFILE
// =========================================================

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const response =
    await companyApiClient.get<CompanyProfile>(
      "/company/me"
    );

  return response.data;
}

// =========================================================
// UPDATE COMPANY PROFILE
// =========================================================

export async function updateCompanyProfile(
  data: CompanyUpdateInput
): Promise<CompanyProfile> {
  try {
    console.log(
      "========== UPDATE COMPANY PROFILE =========="
    );
    console.log("Request data:", data);

    const response =
      await companyApiClient.put<CompanyProfile>(
        "/company/me",
        data
      );

    console.log(
      "Company profile updated:",
      response.status,
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "========== UPDATE COMPANY PROFILE FAILED =========="
    );

    console.error(
      "Status:",
      error?.response?.status
    );

    console.error(
      "Response:",
      error?.response?.data
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Request URL:",
      error?.config?.url
    );

    console.error(
      "Request method:",
      error?.config?.method
    );

    console.error(
      "Request data:",
      error?.config?.data
    );

    throw error;
  }
}

// =========================================================
// COMPANY LOGOUT
// =========================================================

export function logoutCompany(): void {
  localStorage.removeItem(
    "company_access_token"
  );

  localStorage.removeItem(
    "company_refresh_token"
  );
}

// =========================================================
// COMPANY PROGRAMS
// =========================================================

export async function getCompanyPrograms(): Promise<
  BugBountyProgram[]
> {
  const response =
    await companyApiClient.get<BugBountyProgram[]>(
      "/company/programs"
    );

  return response.data;
}

// =========================================================
// GET SINGLE PROGRAM
// =========================================================

export async function getCompanyProgram(
  id: number
): Promise<BugBountyProgram> {
  const response =
    await companyApiClient.get<BugBountyProgram>(
      `/company/programs/${id}`
    );

  return response.data;
}

// =========================================================
// ALIAS
// =========================================================

export async function getCompanyProgramById(
  id: number
): Promise<BugBountyProgram> {
  return getCompanyProgram(id);
}

// =========================================================
// CREATE PROGRAM
// =========================================================

export async function createCompanyProgram(
  data: ProgramCreate
): Promise<BugBountyProgram> {
  const response =
    await companyApiClient.post<BugBountyProgram>(
      "/company/programs",
      data
    );

  return response.data;
}

// =========================================================
// UPDATE PROGRAM
// =========================================================

export async function updateCompanyProgram(
  id: number,
  data: ProgramUpdate
): Promise<BugBountyProgram> {
  const response =
    await companyApiClient.put<BugBountyProgram>(
      `/company/programs/${id}`,
      data
    );

  return response.data;
}

// =========================================================
// DELETE PROGRAM
// =========================================================

export async function deleteCompanyProgram(
  id: number
): Promise<void> {
  await companyApiClient.delete(
    `/company/programs/${id}`
  );
}

// =========================================================
// PROGRAM STATUS HELPERS
// =========================================================

export async function activateCompanyProgram(
  id: number
): Promise<BugBountyProgram> {
  return updateCompanyProgram(id, {
    status: "active",
    is_active: true,
  });
}

export async function pauseCompanyProgram(
  id: number
): Promise<BugBountyProgram> {
  return updateCompanyProgram(id, {
    status: "paused",
  });
}

export async function closeCompanyProgram(
  id: number
): Promise<BugBountyProgram> {
  return updateCompanyProgram(id, {
    status: "closed",
    is_active: false,
  });
}

// =========================================================
// COMPANY EMPLOYEES
// =========================================================

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  employee_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeCreate {
  full_name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  employee_id: string;
  role: "internal_tester";
}

export interface EmployeeUpdate {
  full_name?: string;
  department?: string;
  designation?: string;
  is_active?: boolean;
}

// =========================================================
// GET ALL EMPLOYEES
// =========================================================

export async function getEmployees(): Promise<Employee[]> {
  const response = await companyApiClient.get<Employee[]>(
    "/company/employees"
  );

  return response.data;
}

// =========================================================
// GET SINGLE EMPLOYEE
// =========================================================

export async function getEmployee(
  id: number
): Promise<Employee> {
  const response = await companyApiClient.get<Employee>(
    `/company/employees/${id}`
  );

  return response.data;
}

// =========================================================
// CREATE EMPLOYEE
// =========================================================

export async function createEmployee(
  data: EmployeeCreate
): Promise<Employee> {
  const response = await companyApiClient.post<Employee>(
    "/company/employees",
    data
  );

  return response.data;
}

// =========================================================
// UPDATE EMPLOYEE
// =========================================================

export async function updateEmployee(
  id: number,
  data: EmployeeUpdate
): Promise<Employee> {
  const response = await companyApiClient.put<Employee>(
    `/company/employees/${id}`,
    data
  );

  return response.data;
}

// =========================================================
// DELETE EMPLOYEE
// =========================================================

export async function deleteEmployee(
  id: number
): Promise<void> {
  await companyApiClient.delete(
    `/company/employees/${id}`
  );
}