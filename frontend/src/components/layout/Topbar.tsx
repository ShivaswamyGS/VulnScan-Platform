import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      <h1 className="text-base font-semibold text-[var(--color-ink)]">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium leading-tight">{user?.full_name}</p>
          <p className="text-xs leading-tight text-[var(--color-ink-muted)]">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </header>
  );
}
