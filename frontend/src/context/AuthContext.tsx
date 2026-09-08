import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginRequest,
} from "../api/auth";

import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then((data) => {
        console.log(
          "CURRENT USER FROM /auth/me:",
          data
        );

        console.log(
          "CURRENT USER ROLE:",
          data.role
        );

        setUser(data);
      })
      .catch((error) => {
        console.error(
          "FAILED TO LOAD CURRENT USER:",
          error
        );

        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(
    email: string,
    password: string
  ): Promise<void> {
    const tokens = await loginRequest(
      email,
      password
    );

    localStorage.setItem(
      "access_token",
      tokens.access_token
    );

    localStorage.setItem(
      "refresh_token",
      tokens.refresh_token
    );

    const currentUser =
      await getCurrentUser();

    console.log(
      "USER AFTER LOGIN:",
      currentUser
    );

    console.log(
      "ROLE AFTER LOGIN:",
      currentUser.role
    );

    setUser(currentUser);
  }

  function logout() {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return ctx;
}