import React, { useState } from "react";

import {
  FileText,
  LogOut,
  Send,
  Shield,
  Target,
  X,
  LayoutDashboard,
  Users,
  Building2,
  Database,
  BrainCircuit,
  ScrollText,
  Settings,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Topbar } from "./Topbar";

type AppLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function AppLayout({
  title,
  children,
}: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  /*
   * =========================================================
   * CURRENT USER / ROLE
   * =========================================================
   */

  const userRole = String(
    user?.role ?? ""
  )
    .trim()
    .toLowerCase();

  /*
   * =========================================================
   * ROLE DETECTION
   * =========================================================
   */

 const pathname = location.pathname;

const isCompany = pathname.startsWith("/company");

const isAdmin =
  !isCompany &&
  (
    userRole === "admin" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/admin/")
  );
/*
   * =========================================================
   * ADMIN NAVIGATION
   * =========================================================
   */

  const adminNavigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: FileText,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Companies",
      path: "/admin/companies",
      icon: Building2,
    },
    {
      label: "Datasets",
      path: "/admin/datasets",
      icon: Database,
    },
    {
      label: "AI Training",
      path: "/admin/ai-training",
      icon: BrainCircuit,
    },
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: ScrollText,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  /*
   * =========================================================
   * COMPANY NAVIGATION
   * =========================================================
   */

  const companyNavigation = [
    {
      label: "My Reports",
      path: "/company/reports",
      icon: FileText,
    },
    {
      label: "Submit Report",
      path: "/company/submissions",
      icon: Send,
    },
    {
      label: "Bug Bounty Programs",
      path: "/company/programs",
      icon: Target,
    },

    {
  label: "Employees",
  path: "/company/employees",
  icon: Users,
},
    {
      label: "My Submissions",
      path: "/company/submissions",
      icon: Shield,
    },
  ];

  /*
   * =========================================================
   * RESEARCHER / INTERNAL TESTER NAVIGATION
   * =========================================================
   */

  const researcherNavigation = [
    {
      label: "My Reports",
      path: "/reports",
      icon: FileText,
    },
    {
      label: "Submit Report",
      path: "/reports/new",
      icon: Send,
    },
    {
      label: "Bug Bounty Programs",
      path: "/researcher/programs",
      icon: Target,
    },
    {
      label: "My Submissions",
      path: "/my-submissions",
      icon: Shield,
    },
  ];

  /*
   * =========================================================
   * SELECT NAVIGATION
   * =========================================================
   */

  const navigation = isAdmin
    ? adminNavigation
    : isCompany
    ? companyNavigation
    : researcherNavigation;

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  function handleLogout() {
    if (isCompany) {
      localStorage.removeItem(
        "company_access_token"
      );

      localStorage.removeItem(
        "company_refresh_token"
      );

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
      });

      return;
    }

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  }

  /*
   * =========================================================
   * ACTIVE LINK
   * =========================================================
   */

  function isActive(path: string) {
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard"
      );
    }

    if (path === "/admin/reports") {
      return (
        location.pathname ===
          "/admin/reports" ||
        location.pathname.startsWith(
          "/admin/reports/"
        )
      );
    }

    if (path === "/admin/users") {
      return (
        location.pathname ===
          "/admin/users" ||
        location.pathname.startsWith(
          "/admin/users/"
        )
      );
    }

    if (path === "/admin/companies") {
      return (
        location.pathname ===
          "/admin/companies" ||
        location.pathname.startsWith(
          "/admin/companies/"
        )
      );
    }

    if (path === "/admin/programs") {
      return (
        location.pathname ===
          "/admin/programs" ||
        location.pathname.startsWith(
          "/admin/programs/"
        )
      );
    }

    if (path === "/admin/datasets") {
      return (
        location.pathname ===
          "/admin/datasets" ||
        location.pathname.startsWith(
          "/admin/datasets/"
        )
      );
    }

    if (path === "/admin/ai-training") {
      return (
        location.pathname ===
          "/admin/ai-training" ||
        location.pathname.startsWith(
          "/admin/ai-training/"
        )
      );
    }

    if (path === "/admin/audit-logs") {
      return (
        location.pathname ===
          "/admin/audit-logs" ||
        location.pathname.startsWith(
          "/admin/audit-logs/"
        )
      );
    }

    if (path === "/admin/settings") {
      return (
        location.pathname ===
          "/admin/settings" ||
        location.pathname.startsWith(
          "/admin/settings/"
        )
      );
    }

    if (path === "/company/programs") {
      return (
        location.pathname ===
          "/company/programs" ||
        location.pathname ===
          "/company/programs/new" ||
        location.pathname.startsWith(
          "/company/programs/"
        )
      );
    }

    if (path === "/company/reports") {
      return (
        location.pathname ===
          "/company/reports" ||
        location.pathname.startsWith(
          "/company/reports/"
        )
      );
    }

    if (path === "/company/submissions") {
      return (
        location.pathname ===
          "/company/submissions" ||
        location.pathname.startsWith(
          "/company/submissions/"
        )
      );
    }

    if (path === "/reports") {
      return (
        location.pathname === "/reports" ||
        location.pathname.startsWith(
          "/reports/"
        )
      );
    }

    if (path === "/researcher/programs") {
      return (
        location.pathname ===
          "/researcher/programs" ||
        location.pathname.startsWith(
          "/researcher/programs/"
        )
      );
    }

    if (path === "/my-submissions") {
      return (
        location.pathname ===
          "/my-submissions" ||
        location.pathname.startsWith(
          "/my-submissions/"
        )
      );
    }

    return location.pathname === path;
  }

  /*
   * =========================================================
   * SIDEBAR
   * =========================================================
   */

  function Sidebar() {
    const homePath = isAdmin
      ? "/dashboard"
      : isCompany
      ? "/company/programs"
      : "/researcher/programs";

    return (
      <aside className="flex h-full w-[250px] flex-col bg-[#0b1428] text-white">

        {/* BRAND */}

        <div className="flex h-[72px] items-center border-b border-white/10 px-5">
          <Link
            to={homePath}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Shield size={20} />
            </div>

            <div>
              <div className="text-sm font-bold">
                VulnTriage
              </div>

              <div className="text-[9px] font-semibold tracking-[0.18em] text-blue-300">
                SECURITY PLATFORM
              </div>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}

        <div className="px-4 pt-6">

          <p className="mb-3 px-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {isAdmin
              ? "Administration"
              : "Workspace"}
          </p>

          <nav className="space-y-1">

            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <Icon size={17} />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}

          </nav>
        </div>

        {/* BOTTOM */}

        <div className="mt-auto border-t border-white/10 p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} />

            Log out
          </button>

        </div>

      </aside>
    );
  }

  /*
   * =========================================================
   * MAIN LAYOUT
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* DESKTOP SIDEBAR */}

      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>

      {/* MOBILE SIDEBAR */}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileOpen(false)
            }
          />

          <div className="relative h-full w-[250px]">

            <Sidebar />

            <button
              type="button"
              onClick={() =>
                setMobileOpen(false)
              }
              className="absolute right-3 top-4 rounded-md p-2 text-white hover:bg-white/10"
            >
              <X size={20} />
            </button>

          </div>
        </div>
      )}

      {/* CONTENT */}

      <div className="lg:pl-[250px]">

        {/* =================================================
            SHARED TOPBAR
            ================================================= */}

        <div className="sticky top-0 z-30">
          <Topbar title={title} />
        </div>

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-68px)] p-5 md:p-7">
          {children}
        </main>

      </div>

    </div>
  );
}

export default AppLayout;
