interface StatusBadgeProps {
  name: string;
  isTerminal: boolean;
}

export function StatusBadge({ name, isTerminal }: StatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium"
      style={{
        borderColor: "var(--color-border-strong)",
        color: isTerminal ? "var(--color-success)" : "var(--color-ink-muted)",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: isTerminal ? "var(--color-success)" : "var(--color-ink-faint)" }}
      />
      {name}
    </span>
  );
}
