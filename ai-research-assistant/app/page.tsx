"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { AnimatedBackground } from "@/components/research/animated-background";
import { Navbar } from "@/components/research/navbar";
import { PrimaryButton } from "@/components/research/primary-button";
import { Reveal } from "@/components/research/reveal";
import { SearchInput } from "@/components/research/search-input";
import { TiltPanel } from "@/components/research/tilt-panel";
import { trendingTopics } from "@/lib/mock-data";

export default function Home() {
  const [topic, setTopic] = useState("");
  const router = useRouter();

  function submitTopic(inputTopic: string) {
    const trimmed = inputTopic.trim();
    if (!trimmed) {
      return;
    }

    router.push(`/processing?topic=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Navbar />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-250 flex-col items-center justify-center px-4 pt-12 pb-28 text-center md:px-6 md:pb-12">
        <Reveal className="w-full max-w-210">
          <TiltPanel className="px-5 py-7 md:px-9 md:py-10">
            <section className="w-full space-y-6 md:space-y-8">
              <motion.h1
                className="font-(family-name:--font-heading) text-[36px] leading-tight text-foreground md:text-[42px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
              >
                AI Research Assistant
              </motion.h1>

              <p className="mx-auto max-w-160 text-base leading-8 text-muted-foreground">
                Enter a topic and generate a literature review in seconds.
              </p>

              <div className="hidden space-y-4 sm:block">
                <SearchInput
                  value={topic}
                  onValueChange={setTopic}
                  onSubmit={submitTopic}
                  suggestions={trendingTopics}
                />

                <PrimaryButton
                  type="button"
                  onClick={() => submitTopic(topic)}
                  aria-label="Generate literature review"
                  className="w-full"
                >
                  Generate Literature Review
                </PrimaryButton>
              </div>

              <div className="rounded-2xl border border-border bg-[linear-gradient(160deg,#fffdf7_0%,#f3ecdd_100%)] p-4 text-left md:p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">Example Topics</h2>
                <ul className="mt-3 grid gap-2">
                  {[
                    "Federated Learning Security",
                    "Diffusion Models in Medical Imaging",
                    "Reinforcement Learning in Robotics",
                  ].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.09, duration: 0.45 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setTopic(item);
                          submitTopic(item);
                        }}
                        className="rounded-md text-sm text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                      >
                        {item}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </section>
          </TiltPanel>
        </Reveal>

        <div className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-border bg-[rgb(255_253_247/0.95)] p-3 shadow-[0_22px_36px_-24px_rgba(22,55,52,0.45)] backdrop-blur sm:hidden">
          <div className="space-y-3">
            <SearchInput
              value={topic}
              onValueChange={setTopic}
              onSubmit={submitTopic}
              suggestions={trendingTopics}
            />
            <PrimaryButton
              type="button"
              onClick={() => submitTopic(topic)}
              aria-label="Generate literature review"
              className="w-full"
            >
              Generate Literature Review
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
