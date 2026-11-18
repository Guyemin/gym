"use client";

import Link from "next/link";
import { READING } from "@/data/reading";
import { useProgress } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { StatChips } from "@/components/Stats";

export default function ReadPage() {
  const p = useProgress();
  const lettersDone = Object.keys(p.letters).length;
  return (
    <main>
      <PageHeader title="לומדים לקרוא" subtitle="מאותיות למילים, ממילים למשפטים" right={<StatChips />} />
      {lettersDone < 10 && (
        <Link href="/alphabet" className="mb-4 block rounded-2xl bg-accent-soft p-4 text-sm">
          💡 מומלץ להכיר קודם כמה אותיות. למדת {lettersDone} מתוך 28 – <b className="text-accent">לאלפבית ←</b>
        </Link>
      )}
      <ol className="relative space-y-3 before:absolute before:bottom-6 before:right-7 before:top-6 before:w-0.5 before:bg-line">
        {READING.map((r, i) => {
          const score = p.completed[`read:${r.id}`];
          const done = score !== undefined;
          return (
            <li key={r.id} className="relative">
              <Link href={`/read/${r.id}`} className="flex items-center gap-4 rounded-3xl border border-line bg-card p-3 transition hover:border-brand">
                <span
                  className={`relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-lg font-bold ${
                    done ? "bg-good text-white" : "bg-card-2 text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{r.title}</div>
                  <div className="text-xs text-muted">
                    {r.subtitle} · {r.items.length} פריטים {!r.vowelled && "· בלי ניקוד"}
                  </div>
                </div>
                {done && <span className="text-sm font-semibold text-good">{score}%</span>}
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
