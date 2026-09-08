import axios from "axios";

/*
 * =========================================================
 * API BASE URL
 * =========================================================
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

/*
 * =========================================================
 * MAIN API CLIENT
 * =========================================================
 */

export const apiClient = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * =========================================================
 * DETECT COMPANY REQUEST
 * =========================================================
 *
 * Company APIs use company_access_token.
 *
 * Normal researcher/admin APIs use access_token.
 */

function isCompanyRequest(
  url?: string
): boolean {
  if (!url) {
    return false;
  }

  return (
    url.startsWith("/company") ||
    url.includes("/company/") ||
    url.startsWith("/submissions/company") ||
    url.includes("/submissions/company/")
  );
}

/*
 * =========================================================
 * REQUEST INTERCEPTOR
 * =========================================================
 */

apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    const companyRequest =
      isCompanyRequest(url);

      // =========================================================
// HANDLE FILE UPLOADS
// =========================================================

if (config.data instanceof FormData) {
  delete config.headers["Content-Type"];
}

    /*
     * COMPANY REQUEST
     */

    if (companyRequest) {
      const companyToken =
        localStorage.getItem(
          "company_access_token"
        );

      if (companyToken) {
        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${companyToken}`;
      }

      return config;
    }

    /*
     * NORMAL USER / RESEARCHER / ADMIN REQUEST
     */

    const accessToken =
      localStorage.getItem("access_token");

    if (accessToken) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/*
 * =========================================================
 * RESPONSE INTERCEPTOR
 * =========================================================
 */

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status =
      error.response?.status;

    const requestUrl =
      error.config?.url || "";

    const companyRequest =
      isCompanyRequest(requestUrl);

    /*
     * COMPANY AUTH FAILURE
     */

    if (
      status === 401 &&
      companyRequest
    ) {
      console.error(
        "Company authentication expired."
      );

      localStorage.removeItem(
        "company_access_token"
      );

      localStorage.removeItem(
        "company_refresh_token"
      );

      /*
       * IMPORTANT:
       * Do NOT send company users to /login.
       */

      if (
        window.location.pathname !==
        "/company/login"
      ) {
        window.location.href =
          "/company/login";
      }
    }

    /*
     * NORMAL USER AUTH FAILURE
     */

    else if (
      status === 401 &&
      !companyRequest
    ) {
      console.error(
        "Normal user authentication expired."
      );

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem(
        "user"
      );

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.href =
          "/login";
      }
    }

    return Promise.reject(error);
  }
);

/*
 * =========================================================
 * ERROR MESSAGE HELPER
 * =========================================================
 */

export function getErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (
      typeof data === "object" &&
      data !== null
    ) {
      const detail =
        (data as any).detail;

      if (typeof detail === "string") {
        return detail;
      }

      const message =
        (data as any).message;

      if (typeof message === "string") {
        return message;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}