"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Braces, Check, Copy, Download, RotateCcw } from "lucide-react";

import { AnimatedBackground } from "@/components/research/animated-background";
import { Navbar } from "@/components/research/navbar";
import { PaperCard } from "@/components/research/paper-card";
import { PrimaryButton } from "@/components/research/primary-button";
import { Reveal } from "@/components/research/reveal";
import { SummarySection } from "@/components/research/summary-section";
import { TiltPanel } from "@/components/research/tilt-panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getResearchRecord } from "@/lib/mock-data";
import { fetchResearch, getSavedResearch, saveResearchResult, type ResearchResult } from "@/lib/research-api";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get("topic") ?? "AI Research Topic";

  const fallbackResearch = useMemo(() => getResearchRecord(topic), [topic]);
  const [research, setResearch] = useState<ResearchResult>({
    topic: fallbackResearch.topic,
    summary: fallbackResearch.summary,
    keyFindings: fallbackResearch.keyFindings,
    keyPapers: fallbackResearch.keyPapers,
    researchGaps: fallbackResearch.researchGaps,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visibleParagraphs, setVisibleParagraphs] = useState(1);
  const [copied, setCopied] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function loadResearch() {
      setIsLoading(true);
      setErrorMessage(null);

      const saved = getSavedResearch(topic);
      if (saved) {
        setResearch(saved);
        setIsLoading(false);
        return;
      }

      try {
        const remote = await fetchResearch(topic);
        if (!disposed) {
          setResearch(remote);
          saveResearchResult(remote);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load research data";
        if (!disposed) {
          setErrorMessage(message);
        }
      } finally {
        if (!disposed) {
          setIsLoading(false);
        }
      }
    }

    loadResearch();

    return () => {
      disposed = true;
    };
  }, [topic]);

  useEffect(() => {
    setVisibleParagraphs(1);

    const interval = window.setInterval(() => {
      setVisibleParagraphs((prev) => {
        if (prev >= research.summary.length) {
          window.clearInterval(interval);
          return prev;
        }

        return prev + 1;
      });
    }, 1100);

    return () => window.clearInterval(interval);
  }, [research.summary]);

  const renderedSummary = research.summary.slice(0, visibleParagraphs).join("\n\n");

  async function copySummary() {
    await navigator.clipboard.writeText(renderedSummary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyLatex() {
    if (!research.latexCode) {
      return;
    }

    await navigator.clipboard.writeText(research.latexCode);
    setCopiedLatex(true);
    window.setTimeout(() => setCopiedLatex(false), 1600);
  }

  function downloadCompiledPdf() {
    if (!research.pdfUrl) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = research.pdfUrl;
    anchor.download = `${research.topic.toLowerCase().replace(/\s+/g, "-")}-report.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Navbar />

      <main className="mx-auto w-full max-w-250 space-y-10 px-4 pt-14 pb-10 md:px-6">
        <Reveal>
          <TiltPanel className="p-6 md:p-8">
            <section className="space-y-3">
              <p className="text-sm text-muted-foreground">Topic</p>
              <motion.h1
                className="font-(family-name:--font-heading) text-[32px] leading-tight text-foreground md:text-[42px]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {research.topic}
              </motion.h1>
            </section>
          </TiltPanel>
        </Reveal>

        <Separator className="bg-border" />

        <Reveal delay={0.1}>
          <SummarySection title="Summary">
            {isLoading ? (
              <p className="text-base leading-8 text-muted-foreground">Generating final report...</p>
            ) : null}

          <div className="space-y-4 text-base leading-8 text-foreground" aria-live="polite">
            {research.summary.slice(0, visibleParagraphs).map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 18)}-${index}`} className="animate-summary-in">
                {paragraph}
              </p>
            ))}
          </div>
          </SummarySection>
        </Reveal>

        <Reveal delay={0.18}>
          <SummarySection title="Key Findings">
          <ul className="list-disc space-y-3 pl-6 text-base text-foreground">
            {research.keyFindings.map((finding) => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
          </SummarySection>
        </Reveal>

        <Reveal delay={0.24}>
          <SummarySection title="Key Papers">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {research.keyPapers.map((paper) => (
              <PaperCard
                key={`${paper.title}-${paper.url}`}
                paper={{
                  id: `${paper.title}-${paper.url}`,
                  title: paper.title,
                  authors: paper.authors ?? "Unknown",
                  year: paper.year ?? 2026,
                  url: paper.url,
                }}
              />
            ))}
          </div>
          </SummarySection>
        </Reveal>

        <Reveal delay={0.3}>
          <SummarySection title="Research Gaps">
          <ul className="list-disc space-y-3 pl-6 text-base text-foreground">
            {research.researchGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          </SummarySection>
        </Reveal>

        <Reveal delay={0.36}>
          <SummarySection title="Actions" className="pb-8">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={copySummary}
              aria-label="Copy generated summary"
              className="h-11 rounded-xl border-border bg-card"
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy Summary"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={downloadCompiledPdf}
              aria-label="Download compiled PDF"
              disabled={!research.pdfUrl}
              className="h-11 rounded-xl border-border bg-card"
            >
              <Download className="mr-2 h-4 w-4" />
              {research.pdfUrl ? "Download Compiled PDF" : "PDF Unavailable"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={copyLatex}
              disabled={!research.latexCode}
              aria-label="Copy generated LaTeX"
              className="h-11 rounded-xl border-border bg-card"
            >
              {copiedLatex ? <Check className="mr-2 h-4 w-4" /> : <Braces className="mr-2 h-4 w-4" />}
              {copiedLatex ? "LaTeX Copied" : "Copy LaTeX"}
            </Button>

            <PrimaryButton
              type="button"
              onClick={() => router.push(`/processing?topic=${encodeURIComponent(research.topic)}`)}
              aria-label="Regenerate literature review"
              className="h-11"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Regenerate
            </PrimaryButton>
          </div>
          </SummarySection>
        </Reveal>

        {errorMessage ? (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[#e6bcbc] bg-[#f9ece9] p-4 text-sm text-[#9e2f2f]"
          >
            <p className="font-medium">Showing fallback content</p>
            <p className="mt-1">{errorMessage}</p>
          </motion.section>
        ) : null}
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navbar />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
