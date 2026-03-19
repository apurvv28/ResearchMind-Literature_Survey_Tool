"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,118,110,0.18),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(22,182,161,0.14),transparent_38%),linear-gradient(180deg,#fffdf7_0%,#f8f3e7_100%)]" />

      <motion.div
        className="absolute top-[8%] left-[12%] h-56 w-56 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(15,118,110,0.48))] blur-[1px]"
        animate={{ y: [0, -26, 0], x: [0, 18, 0], rotate: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[10%] bottom-[14%] h-64 w-64 rounded-[32%] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(22,182,161,0.52))]"
        animate={{ y: [0, 32, 0], x: [0, -22, 0], rotate: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-1/2 top-[58%] h-40 w-40 -translate-x-1/2 rounded-2xl border border-white/55 bg-white/40 shadow-[0_24px_50px_-40px_rgba(15,118,110,0.55)] backdrop-blur-sm"
        animate={{ rotateX: [0, 28, 0], rotateY: [0, -35, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      />
    </div>
  );
}
