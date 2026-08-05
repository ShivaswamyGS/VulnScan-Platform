import type { Severity } from "../../types";

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; soft: string }> = {
  critical: { label: "Critical", color: "var(--color-critical)", soft: "var(--color-critical-soft)" },
  high: { label: "High", color: "var(--color-high)", soft: "var(--color-high-soft)" },
  medium: { label: "Medium", color: "var(--color-medium)", soft: "var(--color-medium-soft)" },
  low: { label: "Low", color: "var(--color-low)", soft: "var(--color-low-soft)" },
};

interface SeverityBadgeProps {
  severity: Severity;
  confidence?: number;
  size?: "sm" | "md";
}

/**
 * The platform's signature element: severity is never shown alone. A short
 * confidence bar always rides alongside it, so the badge itself communicates
 * "AI-assisted estimate," not "verified fact" — which is the actual thesis
 * of this project (augmenting, not replacing, human triage judgment).
 */
export function SeverityBadge({ severity, confidence, size = "md" }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] font-medium ${padding}`}
      style={{ backgroundColor: config.soft, color: config.color }}
      title={confidence !== undefined ? `Model confidence: ${Math.round(confidence * 100)}%` : undefined}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
      {confidence !== undefined && (
        <span className="flex items-center gap-1">
          <span className="h-1 w-8 rounded-full bg-black/10 overflow-hidden">
            <span
              className="block h-full rounded-full"
              style={{ width: `${Math.round(confidence * 100)}%`, backgroundColor: config.color }}
            />
          </span>
          <span className="font-mono text-[10px] opacity-70">{Math.round(confidence * 100)}%</span>
        </span>
      )}
    </span>
  );
}
