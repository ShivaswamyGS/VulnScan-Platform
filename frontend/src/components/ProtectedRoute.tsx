import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // ---------------------------------------------------------
  // WAIT FOR AUTHENTICATION TO LOAD
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // NOT LOGGED IN
  // ---------------------------------------------------------

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ---------------------------------------------------------
  // NORMALIZE ROLE
  // ---------------------------------------------------------

  const userRole = String(user.role || "")
    .trim()
    .toLowerCase();

  // ---------------------------------------------------------
  // NO ROLE RESTRICTION
  // ---------------------------------------------------------

  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // ---------------------------------------------------------
  // NORMALIZE ALLOWED ROLES
  // ---------------------------------------------------------

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).trim().toLowerCase()
  );

  // ---------------------------------------------------------
  // AUTHORIZED
  // ---------------------------------------------------------

  if (normalizedAllowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  // ---------------------------------------------------------
  // TEMPORARY: ALLOW ADMIN TO ACCESS RESEARCHER AREA
  // ---------------------------------------------------------

  if (
    userRole === "admin" &&
    location.pathname.startsWith("/researcher")
  ) {
    return <>{children}</>;
  }

  // ---------------------------------------------------------
  // INTERNAL TESTER
  // ---------------------------------------------------------

  if (userRole === "internal_tester") {
    return <Navigate to="/researcher/programs" replace />;
  }

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

  if (userRole === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // ---------------------------------------------------------
  // FALLBACK
  // ---------------------------------------------------------

  return <Navigate to="/reports" replace />;
}