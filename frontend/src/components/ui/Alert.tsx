import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

interface AlertProps {
  variant: "error" | "success" | "info";
  children: ReactNode;
}

const CONFIG = {
  error: { icon: AlertTriangle, color: "var(--color-danger)", bg: "var(--color-critical-soft)" },
  success: { icon: CheckCircle2, color: "var(--color-success)", bg: "var(--color-success-soft)" },
  info: { icon: Info, color: "var(--color-accent)", bg: "var(--color-accent-soft)" },
};

export function Alert({ variant, children }: AlertProps) {
  const { icon: Icon, color, bg } = CONFIG[variant];
  return (
    <div
      className="flex items-start gap-2.5 rounded-[var(--radius-md)] px-3.5 py-3 text-sm"
      style={{ backgroundColor: bg, color }}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
