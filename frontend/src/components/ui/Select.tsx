import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select(props, ref) {
    return (
      <select
        ref={ref}
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
        {...props}
      />
    );
  }
);
