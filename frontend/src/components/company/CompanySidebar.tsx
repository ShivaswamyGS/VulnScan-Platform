import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bug,
  Building2,
  FileWarning,
  FolderKanban,
  LayoutDashboard,
  Monitor,
  ScrollText,
  Settings,
  Shield,
  Users,
} from "lucide-react";

const sections = [
  {
    title: "Workspace",
    links: [
      {
        to: "/company/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        to: "/company/reports",
        label: "Reports",
        icon: FileWarning,
      },
      {
        to: "/company/submissions",
        label: "Submissions",
        icon: ScrollText,
      },
      {
        to: "/company/analytics",
        label: "Analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Management",
    links: [
      {
        to: "/company/employees",
        label: "Employees",
        icon: Users,
      },
      {
        to: "/company/projects",
        label: "Projects",
        icon: FolderKanban,
      },
      {
        to: "/company/assets",
        label: "Assets",
        icon: Monitor,
      },
      {
        to: "/company/programs",
        label: "Bug Bounty Programs",
        icon: Bug,
      },
    ],
  },
  {
    title: "Organization",
    links: [
      {
        to: "/company/profile",
        label: "Company Profile",
        icon: Building2,
      },
      {
        to: "/company/settings",
        label: "Settings",
        icon: Settings,
      },
    ],
  },
];

export default function CompanySidebar() {
  return (
    <aside className="flex h-screen w-[250px] shrink-0 flex-col bg-[var(--color-sidebar)] text-slate-300">

      {/* BRAND */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/30">
            <Shield size={19} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-tight text-white">
              VulnTriage
            </div>

            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-blue-400">
              Company Security
            </div>
          </div>

        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-3 py-5">

        {sections.map((section) => (
          <div key={section.title} className="mb-6">

            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {section.title}
            </p>

            <nav className="space-y-1">

              {section.links.map(
                ({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
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
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />

                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                )
              )}

            </nav>
          </div>
        ))}

      </div>

      {/* PLATFORM STATUS */}
      <div className="px-4 pb-4">

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
            Company security services online
          </p>

        </div>

        <div className="mt-3 flex items-center gap-2 px-2 text-[10px] text-slate-600">
          <Activity size={12} />
          <span>VulnTriage v1.0</span>
        </div>

      </div>

    </aside>
  );
}