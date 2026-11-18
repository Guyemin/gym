"use client";

import Link from "next/link";
import { LETTERS, letterForms } from "@/data/letters";
import { markLetter, addXp, useProgress } from "@/lib/store";
import { sfx } from "@/lib/sfx";
import PageHeader from "@/components/PageHeader";
import SpeakButton from "@/components/SpeakButton";
import WordCard from "@/components/WordCard";
import WritingPad from "@/components/WritingPad";
import Pronounce from "@/components/Pronounce";
import { speak } from "@/lib/speech";

const FORM_LABELS = [
  ["isolated", "לבד"],
  ["final", "סוף"],
  ["medial", "אמצע"],
  ["initial", "התחלה"],
] as const;

export default function LetterDetail({ index }: { index: number }) {
  const l = LETTERS[index];
  const prev = LETTERS[index - 1];
  const next = LETTERS[index + 1];
  const p = useProgress();
  const forms = letterForms(l);
  const base = l.id === "alif" ? "أ" : l.char;
  const syllables = [
    { ar: base + "َ", he: "a" },
    { ar: base + "ِ", he: "i" },
    { ar: base + "ُ", he: "u" },
    ...(l.id === "alif" ? [] : [
      { ar: l.char + "َا", he: "aa" },
      { ar: l.char + "ِي", he: "ii" },
      { ar: l.char + "ُو", he: "uu" },
    ]),
  ];
  const learned = !!p.letters[l.id];

  return (
    <main className="space-y-6">
      <PageHeader title={`האות ${l.nameHe}`} subtitle={`${index + 1} מתוך 28`} back="/alphabet" />

      <section className="pattern relative flex flex-col items-center rounded-3xl border border-line bg-card px-4 pb-5 pt-8 text-center shadow-sm">
        {l.difficulty === 3 && (
          <span className="absolute right-3 top-3 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            צליל שאין בעברית
          </span>
        )}
        {!l.connects && (
          <span className="absolute left-3 top-3 rounded-full bg-card-2 px-2.5 py-1 text-xs font-semibold text-muted">
            לא מתחברת קדימה
          </span>
        )}
        <div className="ar text-[8rem] font-semibold leading-none text-brand">{l.char}</div>
        <div className="mt-2 flex items-center gap-3">
          <SpeakButton text={l.name} size="lg" label="השמע את שם האות" />
          <div className="text-right">
            <div className="ar text-2xl">{l.name}</div>
            <div className="text-sm text-muted">
              {l.nameHe} · כמו <b className="text-ink">{l.he}</b>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-brand-soft p-4">
        <h2 className="mb-1 font-bold">🗣️ איך הוגים?</h2>
        <p className="text-sm leading-relaxed">{l.sound}</p>
      </section>

      <section>
        <h2 className="mb-2 font-bold">צורות האות במילה</h2>
        <div className="grid grid-cols-4 gap-2">
          {FORM_LABELS.map(([k, label]) => (
            <div key={k} className="flex flex-col items-center rounded-2xl border border-line bg-card py-3">
              <span className="ar text-4xl leading-tight">{forms[k]}</span>
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
        {!l.connects && (
          <p className="mt-2 text-xs text-muted">
            האות {l.nameHe} מתחברת רק לאות שלפניה, אף פעם לא לאות שאחריה – לכן צורת ההתחלה זהה לצורה הבודדת.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-bold">הברות – הקישו כדי לשמוע</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {syllables.map((s) => (
            <button
              key={s.ar}
              onClick={() => speak(s.ar, { rate: p.settings.rate, voiceURI: p.settings.voiceURI })}
              className="rounded-2xl border border-line bg-card py-2 transition hover:border-brand active:scale-95"
            >
              <div className="ar text-3xl">{s.ar}</div>
              <div className="text-xs text-muted" dir="ltr">
                {s.he}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Pronounce target={l.examples[0].ar} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-bold">מילים לדוגמה</h2>
        <div className="space-y-2">
          {l.examples.map((e) => (
            <WordCard key={e.ar} {...e} big />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-bold">✍️ תרגול כתיבה</h2>
        <WritingPad key={l.id} guide={l.char} />
      </section>

      <button
        onClick={() => {
          if (!learned) {
            markLetter(l.id);
            addXp(5);
            sfx.good();
          }
        }}
        className={`w-full rounded-2xl py-4 text-lg font-bold transition ${
          learned ? "bg-good-soft text-good" : "bg-brand text-brand-ink active:scale-[0.99]"
        }`}
      >
        {learned ? "✓ למדתי את האות" : "סיימתי ללמוד את האות (+5 XP)"}
      </button>

      <nav className="flex gap-2">
        {prev ? (
          <Link href={`/alphabet/${prev.id}`} className="flex flex-1 items-center gap-2 rounded-2xl border border-line bg-card p-3">
            <span className="text-muted">→</span>
            <span className="ar text-2xl">{prev.char}</span>
            <span className="text-sm">{prev.nameHe}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link href={`/alphabet/${next.id}`} className="flex flex-1 items-center justify-end gap-2 rounded-2xl border border-line bg-card p-3">
            <span className="text-sm">{next.nameHe}</span>
            <span className="ar text-2xl">{next.char}</span>
            <span className="text-muted">←</span>
          </Link>
        ) : (
          <Link href="/vowels" className="flex flex-1 items-center justify-end gap-2 rounded-2xl bg-brand-soft p-3 font-semibold text-brand">
            לתנועות ←
          </Link>
        )}
      </nav>
    </main>
  );
}
