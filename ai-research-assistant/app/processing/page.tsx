"use client";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { AnimatedBackground } from "@/components/research/animated-background";
import { Navbar } from "@/components/research/navbar";
import { ProgressStep } from "@/components/research/progress-step";
import { PrimaryButton } from "@/components/research/primary-button";
import { Reveal } from "@/components/research/reveal";
import { TiltPanel } from "@/components/research/tilt-panel";
import { Progress } from "@/components/ui/progress";
import { fetchResearch, saveResearchResult } from "@/lib/research-api";

const steps = [
  "Searching academic databases",
  "Extracting relevant papers",
  "Analyzing citations",
  "Generating summary",
] as const;

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "AI Research Topic";
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(true);

  useEffect(() => {
    let disposed = false;

    const interval = window.setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length));
    }, 1800);

    const startedAt = Date.now();

    async function runResearch() {
      setErrorMessage(null);
      setIsWorking(true);

      try {
        const result = await fetchResearch(topic);
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(0, 6200 - elapsed);

        await new Promise((resolve) => window.setTimeout(resolve, wait));

        if (disposed) {
          return;
        }

        saveResearchResult(result);
        router.push(`/results?topic=${encodeURIComponent(topic)}`);
      } catch (error) {
        if (disposed) {
          return;
        }

        const message = error instanceof Error ? error.message : "Research generation failed.";
        setErrorMessage(message);
      } finally {
        if (!disposed) {
          setIsWorking(false);
        }
      }
    }

    runResearch();

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [router, topic]);

  const progress = useMemo(() => Math.round((activeStep / steps.length) * 100), [activeStep]);

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Navbar />
      <main className="mx-auto flex w-full max-w-250 flex-col gap-8 px-4 pt-16 pb-10 md:px-6">
        <Reveal>
          <TiltPanel className="p-6 md:p-8">
            <section>
              <p className="text-sm text-muted-foreground">Topic</p>
              <motion.h1
                className="mt-2 font-(family-name:--font-heading) text-[32px] leading-tight text-foreground md:text-[42px]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                {topic}
              </motion.h1>
              <p className="mt-4 text-base text-muted-foreground">Estimated completion time: 6-10 seconds</p>

              <div className="mt-6 space-y-3">
                <Progress value={progress} aria-label="Research generation progress" className="h-2 bg-secondary" />
                <p className="text-sm text-muted-foreground">{progress}% completed</p>
              </div>
            </section>
          </TiltPanel>
        </Reveal>

        <Reveal delay={0.2}>
          <section className="space-y-3" aria-live="polite">
            {steps.map((step, index) => (
              <ProgressStep
                key={step}
                label={step}
                status={index < activeStep ? "done" : index === activeStep ? "active" : "pending"}
              />
            ))}
          </section>
        </Reveal>

        {!isWorking && errorMessage ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#e6bcbc] bg-[#f9ece9] p-4 text-sm text-[#8f2323]"
          >
            <p className="font-medium">Backend request failed</p>
            <p className="mt-1">{errorMessage}</p>
            <div className="mt-3">
              <PrimaryButton onClick={() => router.refresh()} aria-label="Retry generation">
                Retry
              </PrimaryButton>
            </div>
          </motion.section>
        ) : null}
      </main>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navbar />
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
