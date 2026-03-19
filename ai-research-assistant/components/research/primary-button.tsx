import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PrimaryButtonProps = React.ComponentProps<typeof Button>;

export function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <Button
      className={cn(
        "h-12 rounded-xl bg-[var(--brand-primary)] px-6 text-base font-medium text-primary-foreground shadow-[0_10px_30px_-18px_rgba(15,118,110,0.78)] transition-all hover:-translate-y-0.5 hover:bg-[#0d675f] hover:shadow-[0_16px_28px_-18px_rgba(15,118,110,0.82)] focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
}
