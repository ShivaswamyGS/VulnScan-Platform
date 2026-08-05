import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShieldAlert, FilePlus2, ListChecks, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const testerLinks = [
  { to: "/reports", label: "My Reports", icon: ListChecks },
  { to: "/reports/new", label: "Submit Report", icon: FilePlus2 },
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "All Reports", icon: ListChecks },
];

export function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : testerLinks;

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-[var(--color-sidebar)] text-slate-300">
      <div className="flex items-center gap-2 px-5 py-5">
        <ShieldAlert size={20} className="text-[var(--color-accent)]" />
        <span className="font-mono text-sm font-semibold tracking-tight text-white">VulnTriage</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/reports"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-sidebar-hover)] text-white"
                  : "text-slate-400 hover:bg-[var(--color-sidebar-hover)] hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-500">
        {user?.role === "admin" ? (
          <div className="flex items-center gap-1.5">
            <Users size={12} /> Administrator
          </div>
        ) : (
          <div>Internal Tester</div>
        )}
      </div>
    </aside>
  );
}
