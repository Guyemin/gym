"use client";

import Link from "next/link";
import { QUIZ_MODES } from "@/lib/quizzes";
import { useDueCount, useProgress } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { StatChips } from "@/components/Stats";

export default function PracticePage() {
  const p = useProgress();
  const total = Object.keys(p.cards).length;
  const due = useDueCount();
  return (
    <main className="space-y-5">
      <PageHeader title="תרגול" subtitle="חידונים קצרים של 10 שאלות" right={<StatChips />} />

      <Link href="/review" className="flex items-center gap-4 rounded-3xl bg-brand p-5 text-brand-ink shadow-lg">
        <span className="text-4xl">🃏</span>
        <div className="flex-1">
          <div className="text-lg font-bold">חזרה מרווחת</div>
          <div className="text-sm opacity-90">
            {total === 0 ? "סיימו שיעור כדי להוסיף כרטיסיות" : due > 0 ? `${due} כרטיסיות לחזרה היום` : `כל ${total} הכרטיסיות מעודכנות ✓`}
          </div>
        </div>
        <span className="text-2xl">←</span>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        {QUIZ_MODES.map((m) => {
          const s = p.completed[`quiz:${m.id}`];
          return (
            <Link key={m.id} href={`/practice/${m.id}`} className="rounded-3xl border border-line bg-card p-4 transition hover:border-brand">
              <div className="ar text-3xl">{m.emoji}</div>
              <div className="mt-2 font-bold">{m.title}</div>
              <div className="text-xs text-muted">{m.desc}</div>
              {s !== undefined && <div className="mt-2 text-xs font-semibold text-good">שיא: {s}%</div>}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
