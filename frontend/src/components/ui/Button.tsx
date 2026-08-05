import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<string, string> = {
  primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60",
  secondary:
    "bg-white text-[var(--color-ink)] border border-[var(--color-border-strong)] hover:bg-[var(--color-canvas)] disabled:opacity-60",
  ghost: "bg-transparent text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)] disabled:opacity-60",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90 disabled:opacity-60",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", isLoading, disabled, children, className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors ${VARIANT_STYLES[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});
