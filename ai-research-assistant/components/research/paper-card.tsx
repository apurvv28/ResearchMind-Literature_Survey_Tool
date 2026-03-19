import { ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Paper } from "@/lib/mock-data";

type PaperCardProps = {
  paper: Paper;
};

export function PaperCard({ paper }: PaperCardProps) {
  return (
    <Card className="group h-full rounded-2xl border-border bg-[rgb(255_253_247_/_0.86)] shadow-[0_18px_40px_-32px_rgba(22,55,52,0.6)] transition-all duration-300 [transform-style:preserve-3d] hover:-translate-y-1.5 hover:shadow-[0_28px_44px_-30px_rgba(15,118,110,0.4)] hover:[transform:perspective(1200px)_rotateX(4deg)_rotateY(-5deg)]">
      <CardHeader className="space-y-3">
        <CardTitle className="font-[family-name:var(--font-heading)] text-[22px] leading-tight text-foreground">
          {paper.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{paper.authors}</p>
        <p className="text-sm font-medium text-foreground">{paper.year}</p>
        <a
          href={paper.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-[#e5dcc7]"
          aria-label={`View paper ${paper.title}`}
        >
          View Paper
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </CardContent>
    </Card>
  );
}
