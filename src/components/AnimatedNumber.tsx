"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedNumber({
  value,
  format = (n) => n.toString(),
  duration = 1500,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(format(0));

  useEffect(() => {
    if (!isInView) return;

    let start: number | null = null;
    let raf: number;

    const animate = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(format(eased * value));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setDisplay(format(value));
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration, format]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
