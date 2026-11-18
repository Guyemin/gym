"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cardContent, type CardContent } from "@/lib/cards";
import { sfx, shuffle } from "@/lib/sfx";
import { speak } from "@/lib/speech";
import { addXp, gradeCard, useProgress } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import SpeakButton from "@/components/SpeakButton";

const BATCH = 20;

export default function ReviewPage() {
  const p = useProgress();
  const [queue, setQueue] = useState<CardContent[] | null>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ good: 0, bad: 0 });

  const build = (all: boolean) => {
    const now = Date.now();
    const ids = Object.entries(p.cards)
      .filter(([, c]) => all || c.due <= now)
      .sort((a, b) => a[1].due - b[1].due)
      .map(([id]) => id);
    const cards = shuffle(ids.slice(0, BATCH)).map(cardContent).filter((c): c is CardContent => !!c);
    setQueue(cards);
    setI(0);
    setFlipped(false);
    setStats({ good: 0, bad: 0 });
  };

  useEffect(() => {
    if (queue === null && Object.keys(p.cards).length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- build the session once progress has loaded
      build(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.cards, queue]);

  const total = Object.keys(p.cards).length;

  if (total === 0) {
    return (
      <main>
        <PageHeader title="חזרה מרווחת" back="/practice" />
        <div className="rounded-3xl border border-line bg-card p-8 text-center">
          <div className="text-5xl">🃏</div>
          <p className="mt-3 font-semibold">עדיין אין כרטיסיות</p>
          <p className="mt-1 text-sm text-muted">כל אות שתלמדו, שיעור קריאה או נושא שתסיימו – יתווספו לכאן אוטומטית.</p>
          <Link href="/alphabet" className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 font-bold text-brand-ink">
            להתחיל ללמוד
          </Link>
        </div>
      </main>
    );
  }

  const card = queue?.[i];

  if (queue && !card) {
    return (
      <main>
        <PageHeader title="חזרה מרווחת" back="/practice" />
        <div className="pop rounded-3xl bg-brand p-8 text-center text-brand-ink">
          <div className="text-5xl">{queue.length ? "✨" : "✅"}</div>
          <p className="mt-3 text-xl font-bold">{queue.length ? "סיימתם את החזרה!" : "אין כרטיסיות לחזרה כרגע"}</p>
          {queue.length > 0 && (
            <p className="mt-1 opacity-90">
              ידעתם {stats.good} · לחזור על {stats.bad}
            </p>
          )}
          <p className="mt-2 text-sm opacity-80">הכרטיסיות יחזרו בדיוק כשתהיו על סף לשכוח אותן.</p>
        </div>
        <button onClick={() => build(true)} className="mt-3 w-full rounded-2xl bg-card-2 py-3 font-semibold">
          לתרגל בכל זאת ({Math.min(BATCH, total)} כרטיסיות)
        </button>
      </main>
    );
  }

  if (!card) return <div className="h-64 animate-pulse rounded-2xl bg-card" />;

  const answer = (ok: boolean) => {
    gradeCard(card.id, ok);
    addXp(1);
    if (ok) sfx.good();
    setStats((s) => ({ good: s.good + (ok ? 1 : 0), bad: s.bad + (ok ? 0 : 1) }));
    setFlipped(false);
    setI((n) => n + 1);
  };

  const kindLabel = card.kind === "letter" ? "אות" : card.kind === "reading" ? "קריאה" : "מדוברת";

  return (
    <main className="space-y-4">
      <PageHeader title="חזרה מרווחת" subtitle={`${i + 1} מתוך ${queue!.length}`} back="/practice" />
      <div className="h-2.5 overflow-hidden rounded-full bg-card-2">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(i / queue!.length) * 100}%` }} />
      </div>

      <button
        className="flip block h-80 w-full"
        onClick={() => {
          if (!flipped) speak(card.ar, { rate: p.settings.rate, voiceURI: p.settings.voiceURI });
          setFlipped((f) => !f);
        }}
      >
        <div className={`flip-inner relative size-full ${flipped ? "flipped" : ""}`}>
          <div className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-line bg-card p-6 shadow-sm">
            <span className="absolute right-4 top-4 rounded-full bg-card-2 px-2.5 py-0.5 text-xs text-muted">{kindLabel}</span>
            <div className={`ar font-semibold ${card.kind === "letter" ? "text-9xl" : "text-5xl"}`}>{card.ar}</div>
            <div className="mt-6 text-sm text-muted">נסו להיזכר – ואז הקישו להפוך</div>
          </div>
          <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-brand bg-brand-soft p-6">
            <div className="ar text-4xl">{card.ar}</div>
            <div className="text-2xl font-bold text-brand">{card.tr}</div>
            <div className="text-lg">{card.he}</div>
            {card.note && <div className="text-xs text-muted">{card.note}</div>}
            <SpeakButton text={card.ar} className="mt-2" />
          </div>
        </div>
      </button>

      {flipped ? (
        <div className="pop grid grid-cols-2 gap-2">
          <button onClick={() => answer(false)} className="rounded-2xl bg-bad-soft py-4 font-bold text-bad">
            ✗ לא ידעתי
          </button>
          <button onClick={() => answer(true)} className="rounded-2xl bg-good-soft py-4 font-bold text-good">
            ✓ ידעתי
          </button>
        </div>
      ) : (
        <button onClick={() => setFlipped(true)} className="w-full rounded-2xl bg-brand py-4 font-bold text-brand-ink">
          הפוך כרטיסייה
        </button>
      )}
    </main>
  );
}
