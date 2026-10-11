import { NavLink, useLocation } from "react-router-dom";

import {
  Activity,
  BrainCircuit,
  Building2,
  Database,
  FileSearch,
  LayoutDashboard,
  ScrollText,
  Shield,
  Users,
  Bug,
  Settings,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

interface NavigationItem {
  to: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
}

/* =========================================================
   ADMIN NAVIGATION
========================================================= */

const adminNavigation: NavigationItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/companies",
    label: "Companies",
    icon: Building2,
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    to: "/admin/reports",
    label: "Reports",
    icon: FileSearch,
  },
  {
    to: "/admin/datasets",
    label: "Datasets",
    icon: Database,
  },
  {
    to: "/admin/training",
    label: "AI Training",
    icon: BrainCircuit,
  },
  {
    to: "/admin/audit-logs",
    label: "Audit Logs",
    icon: ScrollText,
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

/* =========================================================
   TESTER / RESEARCHER NAVIGATION
========================================================= */

const testerNavigation: NavigationItem[] = [
  {
    to: "/reports",
    label: "My Reports",
    icon: FileSearch,
  },
  {
    to: "/reports/new",
    label: "Submit Report",
    icon: Activity,
  },
  {
    to: "/researcher/programs",
    label: "Bug Bounty Programs",
    icon: Bug,
  },
  {
    to: "/my-submissions",
    label: "My Submissions",
    icon: ScrollText,
  },
];

/* =========================================================
   SIDEBAR
========================================================= */

export function Sidebar() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  /*
   * =========================================================
   * NORMALIZE ROLE
   * =========================================================
   */

  const role = String(user?.role ?? "")
    .trim()
    .toLowerCase();

  /*
   * =========================================================
   * ADMIN DETECTION
   * =========================================================
   *
   * We check BOTH:
   *
   * 1. AuthContext user.role
   * 2. Current admin/dashboard route
   *
   * This prevents the sidebar from incorrectly falling back
   * to the researcher navigation.
   */

  const isAdmin =
    role === "admin" ||
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/admin/");

  /*
   * =========================================================
   * AUTH LOADING
   * =========================================================
   */

  if (isLoading) {
    return (
      <aside className="flex h-screen w-[250px] shrink-0 flex-col bg-[var(--color-sidebar)] text-slate-300">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Shield
                size={19}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <div className="text-[15px] font-semibold text-white">
                VulnTriage
              </div>

              <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-blue-400">
                Security Platform
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  /*
   * =========================================================
   * SELECT NAVIGATION
   * =========================================================
   */

  const navigation = isAdmin
    ? adminNavigation
    : testerNavigation;

  /*
   * =========================================================
   * DEBUG
   * =========================================================
   *
   * This will let us verify exactly what Sidebar receives.
   */

  console.log("SIDEBAR USER:", user);
  console.log("SIDEBAR ROLE:", role);
  console.log("SIDEBAR PATH:", location.pathname);
  console.log("SIDEBAR IS ADMIN:", isAdmin);

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <aside className="flex h-screen w-[250px] shrink-0 flex-col bg-[var(--color-sidebar)] text-slate-300">

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/30">
            <Shield
              size={19}
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-tight text-white">
              VulnTriage
            </div>

            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-blue-400">
              Security Platform
            </div>
          </div>

        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div className="px-3 pt-6">

        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {isAdmin
            ? "Administration"
            : "Workspace"}
        </p>

        <nav className="space-y-1">

          {navigation.map(
            ({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={
                  to === "/dashboard" ||
                  to === "/reports"
                }
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-md px-3 py-2.5",
                    "text-[13px] font-medium transition-all duration-150",

                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      strokeWidth={
                        isActive ? 2.2 : 1.8
                      }
                    />

                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            )
          )}

        </nav>
      </div>

      {/* =====================================================
          PLATFORM STATUS
      ===================================================== */}

      <div className="mt-auto px-4 pb-4">

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">

          <div className="flex items-center gap-2">

            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-medium text-slate-300">
              Platform operational
            </span>

          </div>

          <p className="mt-1.5 pl-4 text-[10px] text-slate-500">
            AI triage services online
          </p>

        </div>

        <div className="mt-3 flex items-center gap-2 px-2 text-[10px] text-slate-600">
          <Settings size={12} />
          <span>VulnTriage v1.0</span>
        </div>

      </div>

    </aside>
  );
}