import { lazy, Suspense } from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


// ============================================================
// AUTH
// ============================================================
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CompanyAuthProvider } from "./context/CompanyAuthContext";

import { ProtectedRoute } from "./components/ProtectedRoute";
import CompanyProtectedRoute from "./components/CompanyProtectedRoute";

// ============================================================
// NORMAL AUTH
// ============================================================

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { TesterRegisterPage } from "./pages/auth/TesterRegisterPage";

// ============================================================
// ADMIN
// ============================================================

import AdminCompaniesPage from "./pages/admin/AdminCompaniesPage";
import AITrainingPage from "./pages/admin/AITrainingPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import DatasetManagementPage from "./pages/admin/DatasetManagementPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

// ============================================================
// NORMAL TESTER REPORTS
// ============================================================

import { ReportsListPage } from "./pages/reports/ReportsListPage";
import { ReportDetailPage } from "./pages/reports/ReportDetailPage";
import { SubmitReportPage } from "./pages/reports/SubmitReportPage";
import MySubmissionsPage from "./pages/reports/MySubmissionsPage";

// ============================================================
// TESTER / RESEARCHER PROGRAMS
// ============================================================

import ResearcherProgramsPage from "./pages/researcher/ProgramsPage";
import ResearcherProgramDetailsPage from "./pages/researcher/ProgramDetailsPage";

import SubmitVulnerabilityPage from "./pages/programs/SubmitVulnerabilityPage";

// ============================================================
// COMPANY AUTH
// ============================================================

import CompanyLoginPage from "./pages/company/CompanyLoginPage";
import CompanyRegisterPage from "./pages/company/CompanyRegisterPage";

// ============================================================
// COMPANY DASHBOARD
// ============================================================

import CompanyDashboardPage from "./pages/company/CompanyDashboardPage";

// ============================================================
// COMPANY PROFILE / EMPLOYEES
// ============================================================

import { EmployeeListPage } from "./pages/employees/EmployeeListPage";

import CompanyProfilePage from "./pages/company/CompanyProfilePage";
import CompanySettingsPage from "./pages/company/CompanySettingsPage";

// ============================================================
// COMPANY PROJECTS
// ============================================================

import ProjectsPage from "./pages/company/ProjectsPage";
import ProjectDetailsPage from "./pages/company/ProjectDetailsPage";

// ============================================================
// COMPANY ASSETS
// ============================================================

import AssetsPage from "./pages/company/AssetsPage";
import AssetDetailsPage from "./pages/company/AssetDetailsPage";

// ============================================================
// COMPANY REPORTS
// ============================================================

import CompanyReportsPage from "./pages/company/CompanyReportsPage";
import CompanyReportDetailsPage from "./pages/company/CompanyReportDetailsPage";

// ============================================================
// COMPANY ANALYTICS
// ============================================================

import CompanyAnalyticsPage from "./pages/company/CompanyAnalyticsPage";

// ============================================================
// COMPANY PROGRAMS
// ============================================================

import CompanyProgramsPage from "./pages/company/ProgramsPage";
import CreateProgramPage from "./pages/company/CreateProgramPage";
import CompanyProgramDetailsPage from "./pages/company/CompanyProgramDetailsPage";
import CompanyProgramEditPage from "./pages/company/CompanyProgramEditPage";

// ============================================================
// COMPANY SUBMISSIONS
// ============================================================

import CompanySubmissionsPage from "./pages/company/CompanySubmissionsPage";
import CompanySubmissionDetailsPage from "./pages/company/CompanySubmissionDetailsPage";

// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage")
);

// ============================================================
// PAGE FALLBACK
// ============================================================

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm font-medium text-slate-700">
          Loading VulnTriage
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Loading security operations dashboard...
        </p>
      </div>
    </div>
  );
}

// ============================================================
// HOME REDIRECT
// ============================================================

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/reports" replace />;
}

// ============================================================
// APPLICATION ROUTES
// ============================================================

function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          NORMAL AUTHENTICATION
      ===================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/register/tester"
        element={<TesterRegisterPage />}
      />

      {/* =====================================================
          COMPANY AUTHENTICATION
      ===================================================== */}

      <Route
        path="/company/login"
        element={<CompanyLoginPage />}
      />

      <Route
        path="/company/register"
        element={<CompanyRegisterPage />}
      />

      {/* =====================================================
          COMPANY DASHBOARD
      ===================================================== */}

  <Route
  path="/company/dashboard"
  element={
    <CompanyProtectedRoute>
      <CompanyDashboardPage />
    </CompanyProtectedRoute>
  }
/>

      {/* =====================================================
          COMPANY PROFILE
      ===================================================== */}

      <Route
        path="/company/profile"
        element={
          <CompanyProtectedRoute>
            <CompanyProfilePage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          COMPANY EMPLOYEES
      ===================================================== */}

      <Route
        path="/company/employees"
        element={
          <CompanyProtectedRoute>
            <EmployeeListPage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          COMPANY PROJECTS
      ===================================================== */}

      <Route
        path="/company/projects"
        element={
          <CompanyProtectedRoute>
            <ProjectsPage />
          </CompanyProtectedRoute>
        }
      />

      <Route
        path="/company/projects/:id"
        element={
          <CompanyProtectedRoute>
            <ProjectDetailsPage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          COMPANY ASSETS
      ===================================================== */}

      <Route
        path="/company/assets"
        element={
          <CompanyProtectedRoute>
            <AssetsPage />
          </CompanyProtectedRoute>
        }
      />

      <Route
        path="/company/assets/:id"
        element={
          <CompanyProtectedRoute>
            <AssetDetailsPage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          COMPANY REPORTS
      ===================================================== */}

      <Route
        path="/company/reports"
        element={
          <CompanyProtectedRoute>
            <CompanyReportsPage />
          </CompanyProtectedRoute>
        }
      />

      <Route
        path="/company/reports/:id"
        element={
          <CompanyProtectedRoute>
            <CompanyReportDetailsPage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          COMPANY ANALYTICS
      ===================================================== */}

      <Route
        path="/company/analytics"
        element={
          <CompanyProtectedRoute>
            <CompanyAnalyticsPage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          COMPANY SETTINGS
      ===================================================== */}

      <Route
        path="/company/settings"
        element={
          <CompanyProtectedRoute>
            <CompanySettingsPage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          COMPANY SUBMISSIONS
      ===================================================== */}

      <Route
        path="/company/submissions"
        element={
          <CompanyProtectedRoute>
            <CompanySubmissionsPage />
          </CompanyProtectedRoute>
        }
      />

      <Route
        path="/company/submissions/:id"
        element={
          <CompanyProtectedRoute>
            <CompanySubmissionDetailsPage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          COMPANY BUG BOUNTY PROGRAMS
      ===================================================== */}

      <Route
        path="/company/programs"
        element={
          <CompanyProtectedRoute>
            <CompanyProgramsPage />
          </CompanyProtectedRoute>
        }
      />

      <Route
        path="/company/programs/new"
        element={
          <CompanyProtectedRoute>
            <CreateProgramPage />
          </CompanyProtectedRoute>
        }
      />

      <Route
        path="/company/programs/:id/edit"
        element={
          <CompanyProtectedRoute>
            <CompanyProgramEditPage />
          </CompanyProtectedRoute>
        }
      />

      <Route
        path="/company/programs/:id"
        element={
          <CompanyProtectedRoute>
            <CompanyProgramDetailsPage />
          </CompanyProtectedRoute>
        }
      />

      {/* =====================================================
          INTERNAL TESTER / BUG BOUNTY PROGRAMS
      ===================================================== */}

      <Route
        path="/programs"
        element={
          <ProtectedRoute allowedRoles={["internal_tester"]}>
            <ResearcherProgramsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/programs/:id"
        element={
          <ProtectedRoute allowedRoles={["internal_tester"]}>
            <ResearcherProgramDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/programs/:id/submit"
        element={
          <ProtectedRoute allowedRoles={["internal_tester"]}>
            <SubmitVulnerabilityPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          RESEARCHER PROGRAM MARKETPLACE
      ===================================================== */}

      <Route
        path="/researcher/programs"
        element={
          <ProtectedRoute allowedRoles={["internal_tester"]}>
            <ResearcherProgramsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/researcher/programs/:id"
        element={
          <ProtectedRoute allowedRoles={["internal_tester"]}>
            <ResearcherProgramDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/researcher/programs/:id/submit"
        element={
          <ProtectedRoute allowedRoles={["internal_tester"]}>
            <SubmitVulnerabilityPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          NORMAL TESTER REPORTS
      ===================================================== */}

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports/new"
        element={
          <ProtectedRoute allowedRoles={["internal_tester"]}>
            <SubmitReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute>
            <ReportDetailPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          MY SUBMISSIONS
      ===================================================== */}

      <Route
        path="/my-submissions"
        element={
          <ProtectedRoute allowedRoles={["internal_tester"]}>
            <MySubmissionsPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN — BUG BOUNTY PROGRAMS
      ===================================================== */}

      <Route
        path="/admin/programs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ResearcherProgramsPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN — AI MODEL TRAINING
      ===================================================== */}

      <Route
        path="/admin/ai-training"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AITrainingPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          OLD AI TRAINING ROUTE
          Keep this so existing links do not break.
      ===================================================== */}

      <Route
        path="/admin/training"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AITrainingPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN — SETTINGS
      ===================================================== */}

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN DASHBOARD
      ===================================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Suspense fallback={<PageFallback />}>
              <AdminDashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN REPORTS
      ===================================================== */}

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN DATASETS
      ===================================================== */}

      <Route
        path="/admin/datasets"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DatasetManagementPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN AUDIT LOGS
      ===================================================== */}

      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN COMPANY APPROVAL
      ===================================================== */}

      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCompaniesPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN USERS
      ===================================================== */}

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          HOME
      ===================================================== */}

      <Route
        path="/"
        element={<HomeRedirect />}
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={<HomeRedirect />}
      />
    </Routes>
  );
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyAuthProvider>
          <AppRoutes />
        </CompanyAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;