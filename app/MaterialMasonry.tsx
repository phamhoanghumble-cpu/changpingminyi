"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { masonryLayout } from "@/lib/masonry-layout";

export function MaterialMasonry({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const cards = Array.from(container.children) as HTMLElement[];
    let frame = 0;

    function arrange() {
      if (!container) return;
      const available = container.clientWidth;
      if (!available) return;
      const gap = 24;
      const columns = Math.min(3, Math.max(1, Math.floor((available + gap) / (280 + gap))));
      const width = (available - gap * (columns - 1)) / columns;
      // Set all widths before reading heights; media stays mounted during reflow.
      cards.forEach((card) => { card.style.width = `${width}px`; });
      const heights = cards.map((card) => card.getBoundingClientRect().height);
      const layout = masonryLayout(heights, columns, width, gap);
      cards.forEach((card, index) => {
        const { x, y } = layout.positions[index];
        card.style.transform = `translate(${x}px, ${y}px)`;
      });
      container.style.height = `${layout.height}px`;
      container.dataset.masonryReady = "true";
    }

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(arrange);
    });
    observer.observe(container);
    cards.forEach((card) => observer.observe(card));
    arrange();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [children]);

  return <div ref={ref} className="masonry-wall-container">{children}</div>;
}
