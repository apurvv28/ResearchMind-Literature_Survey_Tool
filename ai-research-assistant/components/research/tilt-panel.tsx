"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type TiltPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function TiltPanel({ children, className }: TiltPanelProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const shadow = useMemo(() => {
    const depth = 25 + Math.abs(rotate.x) + Math.abs(rotate.y);
    return `0 ${depth}px ${depth * 2}px -${depth}px rgba(17,17,17,0.35)`;
  }, [rotate.x, rotate.y]);

  return (
    <motion.div
      className={cn(
        "relative rounded-[22px] border border-white/50 bg-white/70 backdrop-blur-xl",
        className,
      )}
      style={{ transformStyle: "preserve-3d", boxShadow: shadow }}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.35 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        setRotate({
          x: (0.5 - py) * 13,
          y: (px - 0.5) * 15,
        });
      }}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
    >
      <div style={{ transform: "translateZ(24px)" }}>{children}</div>
    </motion.div>
  );
}
