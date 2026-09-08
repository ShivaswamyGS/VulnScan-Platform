import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface CompanyProtectedRouteProps {
  children: ReactNode;
}

export default function CompanyProtectedRoute({
  children,
}: CompanyProtectedRouteProps) {
  const location = useLocation();

  const token = localStorage.getItem("company_access_token");



  if (!token) {
    return (
      <Navigate
        to="/company/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}