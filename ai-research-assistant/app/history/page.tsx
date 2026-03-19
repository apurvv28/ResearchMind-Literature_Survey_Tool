"use client";

import { useEffect, useState } from "react";

import { AnimatedBackground } from "@/components/research/animated-background";
import { HistoryItem } from "@/components/research/history-item";
import { Navbar } from "@/components/research/navbar";
import { Reveal } from "@/components/research/reveal";
import { TiltPanel } from "@/components/research/tilt-panel";
import { getHistoryTopics } from "@/lib/research-api";

export default function HistoryPage() {
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    setTopics(getHistoryTopics());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Navbar />
      <main className="mx-auto w-full max-w-[1000px] space-y-6 px-4 pt-14 pb-10 md:px-6">
        <Reveal>
          <TiltPanel className="p-6 md:p-8">
            <h1 className="font-[family-name:var(--font-heading)] text-[32px] text-foreground md:text-[42px]">
              History
            </h1>

            <section className="mt-5 space-y-3">
              {topics.length > 0 ? (
                topics.map((topic) => <HistoryItem key={topic} topic={topic} />)
              ) : (
                <p className="text-sm text-muted-foreground">No research history yet. Generate a topic to populate this list.</p>
              )}
            </section>
          </TiltPanel>
        </Reveal>
      </main>
    </div>
  );
}
