import { cn } from "@/lib/utils";

type SummarySectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function SummarySection({ title, children, className }: SummarySectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="font-[family-name:var(--font-heading)] text-[28px] leading-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
