import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type HistoryItemProps = {
  topic: string;
};

export function HistoryItem({ topic }: HistoryItemProps) {
  const href = `/results?topic=${encodeURIComponent(topic)}`;

  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-foreground shadow-[0_10px_20px_-20px_rgba(22,55,52,0.45)] transition-all hover:-translate-y-0.5 hover:border-[#b8d7d2] hover:shadow-[0_18px_25px_-22px_rgba(15,118,110,0.48)]"
      aria-label={`Open research topic ${topic}`}
    >
      <span className="text-sm md:text-base">{topic}</span>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
    </Link>
  );
}
