"use client";

import { useEffect, useRef, useState } from "react";

export default function StatCounter({
  target,
  suffix,
  format = false,
  duration = 2000,
}: {
  target: number;
  suffix: string;
  format?: boolean;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(target);
          };

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  const display = format ? count.toLocaleString("ko-KR") : String(count);

  return (
    <div
      ref={ref}
      className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl md:text-4xl font-bold gold-gradient-text mb-1"
    >
      {display}
      {suffix}
    </div>
  );
}
