"use client";

import { useEffect, useRef, useState } from "react";

/** A simple tracing canvas: faint letter in the background, draw over it with finger/mouse. */
export default function WritingPad({ guide }: { guide: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      const g = c.getContext("2d");
      g?.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const clear = () => {
    const c = canvas.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  };

  return (
    <div>
      <div className="relative h-56 overflow-hidden rounded-2xl border border-dashed border-line bg-card pattern">
        {showGuide && (
          <div className="ar pointer-events-none absolute inset-0 grid select-none place-items-center text-[9rem] leading-none text-ink/10">
            {guide}
          </div>
        )}
        <canvas
          ref={canvas}
          className="absolute inset-0 size-full touch-none"
          onPointerDown={(e) => {
            drawing.current = true;
            last.current = pos(e);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drawing.current || !last.current) return;
            const g = canvas.current!.getContext("2d")!;
            const p = pos(e);
            g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--brand") || "#0e7468";
            g.lineWidth = 9;
            g.lineCap = "round";
            g.lineJoin = "round";
            g.beginPath();
            g.moveTo(last.current.x, last.current.y);
            g.lineTo(p.x, p.y);
            g.stroke();
            last.current = p;
          }}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
          }}
        />
      </div>
      <div className="mt-2 flex gap-2 text-sm">
        <button onClick={clear} className="rounded-full bg-card-2 px-4 py-1.5 hover:bg-line">
          נקה
        </button>
        <button onClick={() => setShowGuide((s) => !s)} className="rounded-full bg-card-2 px-4 py-1.5 hover:bg-line">
          {showGuide ? "הסתר קו מנחה" : "הצג קו מנחה"}
        </button>
        <span className="ms-auto self-center text-xs text-muted">כותבים מימין לשמאל ←</span>
      </div>
    </div>
  );
}
