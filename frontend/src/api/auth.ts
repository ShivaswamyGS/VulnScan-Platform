import { apiClient } from "./client";
import type { AuthTokens, Role, User } from "../types";

export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", {
    ...input,
    role: "internal_tester" as Role, // backend forces this regardless; sent for schema completeness
  });
  return data;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  // Backend expects OAuth2 form encoding, not JSON, for /auth/login.
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  const { data } = await apiClient.post<AuthTokens>("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}
