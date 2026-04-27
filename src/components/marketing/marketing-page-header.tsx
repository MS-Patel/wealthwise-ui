import type { ReactNode } from "react";

interface MarketingPageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

export function MarketingPageHeader({ eyebrow, title, subtitle, children }: MarketingPageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div aria-hidden className="absolute inset-0 gradient-hero" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
