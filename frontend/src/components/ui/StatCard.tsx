import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accentColor?: string;
}

export function StatCard({ label, value, icon: Icon, accentColor = "var(--color-ink)" }: StatCardProps) {
  return (
    <Card className="flex items-center gap-3.5 p-4">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
        style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)` }}
      >
        <Icon size={17} style={{ color: accentColor }} />
      </div>
      <div>
        <p className="font-mono text-xl font-semibold leading-none text-[var(--color-ink)]">{value}</p>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{label}</p>
      </div>
    </Card>
  );
}
