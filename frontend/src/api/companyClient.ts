import axios from "axios";

export const companyApiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach company authentication token
companyApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("company_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle authentication errors
companyApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("company_access_token");
      localStorage.removeItem("company_refresh_token");

      window.location.href = "/company/login";
    }

    return Promise.reject(error);
  }
);