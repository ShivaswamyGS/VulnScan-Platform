import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import axios from "axios";
import { loginCompany } from "../api/company";

interface CompanyAuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const CompanyAuthContext =
  createContext<CompanyAuthContextValue | undefined>(undefined);

export function CompanyAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("company_access_token")
  );

  async function login(
    email: string,
    password: string
  ): Promise<void> {
    try {
      // Remove old company tokens before attempting a fresh login.
      localStorage.removeItem("company_access_token");
      localStorage.removeItem("company_refresh_token");

      const tokens = await loginCompany(email.trim(), password);

      console.log("Company login response:", tokens);

      if (!tokens) {
        throw new Error("No response received from company login.");
      }

      if (!tokens.access_token) {
        console.error(
          "Company login response does not contain access_token:",
          tokens
        );

        throw new Error(
          "Login succeeded but the server did not return an access token."
        );
      }

      localStorage.setItem(
        "company_access_token",
        tokens.access_token
      );

      if (tokens.refresh_token) {
        localStorage.setItem(
          "company_refresh_token",
          tokens.refresh_token
        );
      }

      setIsAuthenticated(true);

      console.log(
        "Company authentication successful."
      );
    } catch (error: unknown) {
      // Make sure a failed login never leaves the application
      // in a partially authenticated state.
      localStorage.removeItem("company_access_token");
      localStorage.removeItem("company_refresh_token");

      setIsAuthenticated(false);

      if (axios.isAxiosError(error)) {
        console.error(
          "Company login failed:",
          error.response?.status,
          error.response?.data
        );

        const serverMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.error;

        if (serverMessage) {
          throw new Error(String(serverMessage));
        }

        if (error.response?.status === 401) {
          throw new Error(
            "Company login rejected: invalid email or password."
          );
        }

        if (error.response?.status === 403) {
          throw new Error(
            "Company account is not allowed to log in."
          );
        }

        if (error.response?.status === 404) {
          throw new Error(
            "Company login endpoint was not found."
          );
        }

        if (!error.response) {
          throw new Error(
            "Cannot connect to the backend server."
          );
        }

        throw new Error(
          `Company login failed with status ${error.response.status}.`
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Company login failed.");
    }
  }

  function logout(): void {
    localStorage.removeItem("company_access_token");
    localStorage.removeItem("company_refresh_token");

    setIsAuthenticated(false);
  }

  return (
    <CompanyAuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </CompanyAuthContext.Provider>
  );
}

export function useCompanyAuth(): CompanyAuthContextValue {
  const ctx = useContext(CompanyAuthContext);

  if (!ctx) {
    throw new Error(
      "useCompanyAuth must be used inside CompanyAuthProvider"
    );
  }

  return ctx;
}