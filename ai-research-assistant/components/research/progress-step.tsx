import { Check, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type ProgressStepProps = {
  label: string;
  status: "pending" | "active" | "done";
};

export function ProgressStep({ label, status }: ProgressStepProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 transition-colors",
        status === "done" && "border-[#afd9d3] bg-[#ecf8f5]",
        status === "active" && "border-[#b8d7d2] bg-[#f4f0e6]",
        status === "pending" && "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border",
          status === "done" && "border-[#16B6A1] bg-[#16B6A1] text-primary-foreground",
          status === "active" && "border-primary bg-primary text-primary-foreground",
          status === "pending" && "border-border text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {status === "done" ? (
          <Check className="h-4 w-4" />
        ) : status === "active" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-current" />
        )}
      </span>
      <p
        className={cn(
          "text-sm md:text-base",
          status === "pending" ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {label}
      </p>
    </div>
  );
}
