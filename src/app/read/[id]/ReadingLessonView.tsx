"use client";

import Link from "next/link";
import { useState } from "react";
import { READING } from "@/data/reading";
import { stripHarakat } from "@/lib/arabic";
import { readingCardIds } from "@/lib/cards";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speech";
import { completeLesson, gradeCard, useProgress } from "@/lib/store";
import Breakdown from "@/components/Breakdown";
import PageHeader from "@/components/PageHeader";
import Pronounce from "@/components/Pronounce";
import SpeakButton from "@/components/SpeakButton";
import WordCard from "@/components/WordCard";

export default function ReadingLessonView({ index }: { index: number }) {
  const lesson = READING[index];
  const next = READING[index + 1];
  const [mode, setMode] = useState<"learn" | "practice">("learn");

  return (
    <main className="space-y-5">
      <PageHeader title={lesson.title} subtitle={`שיעור ${index + 1} · ${lesson.subtitle}`} back="/read" />

      <div className="grid grid-cols-2 rounded-2xl bg-card-2 p-1 text-sm font-semibold">
        {(["learn", "practice"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-xl py-2.5 transition ${mode === m ? "bg-card text-ink shadow-sm" : "text-muted"}`}
          >
            {m === "learn" ? "📖 לימוד" : "🎯 תרגול קריאה"}
          </button>
        ))}
      </div>

      {mode === "learn" ? (
        <>
          <p className="rounded-2xl bg-brand-soft p-4 text-sm leading-relaxed">{lesson.intro}</p>
          <div className="space-y-2.5">
            {lesson.items.map((it) => (
              <WordCard key={it.ar} {...it} big={lesson.id !== "sentences" && lesson.id !== "story"} />
            ))}
          </div>
          {lesson.id === "story" && <PlayAll texts={lesson.items.map((i) => i.ar)} />}
          <button onClick={() => setMode("practice")} className="w-full rounded-2xl bg-brand py-4 text-lg font-bold text-brand-ink">
            אני מוכן – בואו נתרגל ←
          </button>
        </>
      ) : (
        <Practice key={lesson.id} index={index} />
      )}

      {next && (
        <Link href={`/read/${next.id}`} className="block rounded-2xl border border-line bg-card p-3 text-center text-sm">
          השיעור הבא: <b>{next.title}</b> ←
        </Link>
      )}
    </main>
  );
}

function PlayAll({ texts }: { texts: string[] }) {
  const { settings } = useProgress();
  const [playing, setPlaying] = useState(false);
  const play = (i: number) => {
    if (i >= texts.length) return setPlaying(false);
    speak(texts[i], { rate: settings.rate, voiceURI: settings.voiceURI, onEnd: () => setTimeout(() => play(i + 1), 350) });
  };
  return (
    <button
      onClick={() => {
        setPlaying(true);
        play(0);
      }}
      className="w-full rounded-2xl border border-brand py-3 font-semibold text-brand"
    >
      {playing ? "🔊 משמיע…" : "▶ השמע את כל הסיפור"}
    </button>
  );
}

function Practice({ index }: { index: number }) {
  const lesson = READING[index];
  const ids = readingCardIds(lesson.id);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [right, setRight] = useState(0);
  const [showBreak, setShowBreak] = useState(false);

  if (i >= lesson.items.length) {
    const score = Math.round((right / lesson.items.length) * 100);
    return (
      <div className="pop space-y-4 text-center">
        <div className="rounded-3xl bg-brand p-8 text-brand-ink">
          <div className="text-6xl">{score >= 80 ? "🌟" : "💪"}</div>
          <div className="mt-2 text-3xl font-bold">{score}%</div>
          <div className="opacity-90">
            קראת נכון {right} מתוך {lesson.items.length}
          </div>
          <div className="mt-2 text-sm opacity-80">המילים נוספו לחזרה המרווחת שלך</div>
        </div>
        <button
          onClick={() => {
            setI(0);
            setRight(0);
            setRevealed(false);
          }}
          className="w-full rounded-2xl bg-card-2 py-3 font-semibold"
        >
          לתרגל שוב
        </button>
      </div>
    );
  }

  const it = lesson.items[i];
  const shown = lesson.vowelled ? it.ar : stripHarakat(it.ar);

  const grade = (ok: boolean) => {
    if (ok) sfx.good();
    gradeCard(ids[i], ok);
    const newRight = right + (ok ? 1 : 0);
    setRight(newRight);
    setRevealed(false);
    setShowBreak(false);
    if (i + 1 >= lesson.items.length) {
      sfx.done();
      completeLesson(`read:${lesson.id}`, Math.round((newRight / lesson.items.length) * 100), ids);
    }
    setI(i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-card-2">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(i / lesson.items.length) * 100}%` }} />
        </div>
        <span className="text-xs tabular-nums text-muted">
          {i + 1}/{lesson.items.length}
        </span>
      </div>

      <div key={i} className="pop rounded-3xl border border-line bg-card p-6 text-center shadow-sm">
        <p className="mb-2 text-sm text-muted">קראו בקול:</p>
        <div className="ar text-5xl font-semibold leading-relaxed">{shown}</div>

        <div className="mt-4 flex justify-center">
          <Pronounce target={it.ar} compact />
        </div>

        {!revealed ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={() => setShowBreak((s) => !s)} className="rounded-full bg-card-2 px-4 py-2 text-sm">
              🔍 רמז: פירוק לאותיות
            </button>
            <button onClick={() => setRevealed(true)} className="rounded-full bg-brand px-6 py-2 font-semibold text-brand-ink">
              הצג תשובה
            </button>
          </div>
        ) : (
          <div className="pop mt-5 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <SpeakButton text={it.ar} />
              <div>
                <div className="text-2xl font-bold text-brand">{it.tr}</div>
                <div className="text-muted">{it.he}</div>
              </div>
            </div>
          </div>
        )}
        {showBreak && (
          <div className="mt-4 flex justify-center">
            <Breakdown word={it.ar} />
          </div>
        )}
      </div>

      {revealed && (
        <div className="pop grid grid-cols-2 gap-2">
          <button onClick={() => grade(false)} className="rounded-2xl bg-bad-soft py-4 font-bold text-bad">
            ✗ טעיתי
          </button>
          <button onClick={() => grade(true)} className="rounded-2xl bg-good-soft py-4 font-bold text-good">
            ✓ קראתי נכון
          </button>
        </div>
      )}
    </div>
  );
}
