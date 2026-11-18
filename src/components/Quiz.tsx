"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { speak } from "@/lib/speech";
import { sfx } from "@/lib/sfx";
import { addXp, gradeCard, useProgress } from "@/lib/store";
import { IconCheck, IconSpeaker, IconX } from "./icons";

export type Option = { key: string; label: React.ReactNode; arabic?: boolean };

export type Question = {
  id?: string; // card id for spaced repetition
  instruction: string;
  prompt?: React.ReactNode;
  audio?: string; // arabic text to auto-play
  options: Option[];
  answer: string;
  explain?: React.ReactNode;
};

export default function Quiz({
  make,
  onFinish,
  backHref,
}: {
  make: () => Question[];
  onFinish?: (score: number) => void;
  backHref: string;
}) {
  const { settings } = useProgress();
  const [qs, setQs] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const finished = useRef(false);
  const makeRef = useRef(make);

  useEffect(() => {
    setQs(makeRef.current());
  }, []);

  useEffect(() => {
    if (qs && i >= qs.length && !finished.current) {
      finished.current = true;
      sfx.done();
      onFinish?.(Math.round((correct / qs.length) * 100));
    }
  }, [qs, i, correct, onFinish]);

  const q = qs?.[i];

  useEffect(() => {
    if (q?.audio) speak(q.audio, { rate: settings.rate, voiceURI: settings.voiceURI });
  }, [q, settings.rate, settings.voiceURI]);

  if (!qs) return <div className="h-64 animate-pulse rounded-2xl bg-card" />;

  if (i >= qs.length) {
    const score = Math.round((correct / qs.length) * 100);
    return (
      <div className="pop space-y-4 text-center">
        <div className="rounded-3xl bg-brand p-8 text-brand-ink">
          <div className="text-6xl">{score >= 90 ? "🏆" : score >= 70 ? "🌟" : score >= 50 ? "💪" : "📚"}</div>
          <div className="mt-3 text-4xl font-bold tabular-nums">{score}%</div>
          <div className="mt-1 opacity-90">
            {correct} מתוך {qs.length} נכונות
          </div>
        </div>
        {mistakes.length > 0 && (
          <div className="rounded-2xl border border-line bg-card p-4 text-right">
            <div className="mb-2 font-semibold">כדאי לחזור על:</div>
            <ul className="space-y-2 text-sm">
              {mistakes.map((m, k) => (
                <li key={k} className="flex flex-wrap items-center gap-2 border-b border-line pb-2 last:border-0">
                  <span className="font-medium [&_*]:text-xl! [&_*]:leading-tight! [&_*]:text-ink!">{m.audio ? <span className="ar">{m.audio}</span> : m.prompt}</span>
                  <span className="text-muted">←</span>
                  <span className={m.options.find((o) => o.key === m.answer)?.arabic ? "ar text-xl" : ""}>
                    {m.options.find((o) => o.key === m.answer)?.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => {
              finished.current = false;
              setQs(makeRef.current());
              setI(0);
              setCorrect(0);
              setMistakes([]);
              setPicked(null);
            }}
            className="flex-1 rounded-2xl bg-brand-soft py-3 font-semibold text-brand"
          >
            עוד סבב
          </button>
          <Link href={backHref} className="flex-1 rounded-2xl bg-card-2 py-3 font-semibold">
            סיום
          </Link>
        </div>
      </div>
    );
  }

  const choose = (key: string) => {
    if (picked) return;
    setPicked(key);
    const ok = key === q!.answer;
    if (ok) {
      setCorrect((c) => c + 1);
      sfx.good();
      addXp(2);
    } else {
      sfx.bad();
      setMistakes((m) => [...m, q!]);
    }
    if (q!.id) gradeCard(q!.id, ok);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-card-2">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(i / qs.length) * 100}%` }} />
        </div>
        <span className="text-xs tabular-nums text-muted">
          {i + 1}/{qs.length}
        </span>
      </div>

      <div key={i} className="pop space-y-4">
        <p className="text-sm font-medium text-muted">{q!.instruction}</p>
        <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-3xl border border-line bg-card p-6 text-center">
          {q!.prompt}
          {q!.audio && (
            <button
              onClick={() => speak(q!.audio!, { rate: settings.rate, voiceURI: settings.voiceURI })}
              className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-medium text-brand"
            >
              <IconSpeaker /> השמע שוב
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {q!.options.map((o) => {
            const isAnswer = o.key === q!.answer;
            const isPicked = o.key === picked;
            const state = !picked
              ? "border-line bg-card hover:border-brand"
              : isAnswer
                ? "border-good bg-good-soft"
                : isPicked
                  ? "border-bad bg-bad-soft"
                  : "border-line bg-card opacity-50";
            return (
              <button
                key={o.key}
                onClick={() => choose(o.key)}
                className={`relative min-h-16 rounded-2xl border-2 px-3 py-3 font-medium transition active:scale-[0.98] ${state} ${
                  o.arabic ? "ar text-2xl" : "text-base"
                }`}
              >
                {o.label}
                {picked && isAnswer && <IconCheck className="absolute left-2 top-2 size-4 text-good" />}
                {picked && isPicked && !isAnswer && <IconX className="absolute left-2 top-2 size-4 text-bad" />}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="pop space-y-3">
            {q!.explain && <div className="rounded-2xl bg-card-2 p-3 text-sm">{q!.explain}</div>}
            <button
              onClick={() => {
                setPicked(null);
                setI((n) => n + 1);
              }}
              className={`w-full rounded-2xl py-3.5 text-lg font-bold text-white ${picked === q!.answer ? "bg-good" : "bg-bad"}`}
            >
              {picked === q!.answer ? "נכון! המשך" : "המשך"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
