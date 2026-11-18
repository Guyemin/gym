"use client";

import { useEffect, useRef, useState } from "react";
import { DIALOGUES } from "@/data/speaking";
import { sfx } from "@/lib/sfx";
import { speak, stopSpeaking } from "@/lib/speech";
import { completeLesson, useProgress } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import Pronounce from "@/components/Pronounce";
import SpeakButton from "@/components/SpeakButton";

type Mode = "listen" | "A" | "B";

export default function DialogueView({ index }: { index: number }) {
  const d = DIALOGUES[index];
  const { settings } = useProgress();
  const [mode, setMode] = useState<Mode>("listen");
  const [active, setActive] = useState(-1);
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const playing = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => () => stopSpeaking(), []);

  const playFrom = (i: number) => {
    if (i >= d.lines.length) {
      playing.current = false;
      setActive(-1);
      return;
    }
    playing.current = true;
    setActive(i);
    speak(d.lines[i].ar, {
      rate: settings.rate,
      voiceURI: settings.voiceURI,
      onEnd: () => {
        if (playing.current) setTimeout(() => playFrom(i + 1), 500);
      },
    });
  };

  // role-play: partner lines auto-play when reached
  useEffect(() => {
    if (mode === "listen" || step >= d.lines.length) return;
    const line = d.lines[step];
    if (line.speaker !== mode) speak(line.ar, { rate: settings.rate, voiceURI: settings.voiceURI });
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [step, mode, d.lines, settings.rate, settings.voiceURI]);

  const startRole = (m: Mode) => {
    stopSpeaking();
    playing.current = false;
    setActive(-1);
    setMode(m);
    setStep(0);
    setRevealed({});
  };

  const visible = mode === "listen" ? d.lines : d.lines.slice(0, step + 1);
  const finished = mode !== "listen" && step >= d.lines.length - 1;

  return (
    <main className="space-y-4">
      <PageHeader title={`${d.emoji} ${d.title}`} subtitle={d.setting} back="/speak#dialogues" />

      <div className="grid grid-cols-3 rounded-2xl bg-card-2 p-1 text-sm font-semibold">
        {(
          [
            ["listen", "🎧 האזנה"],
            ["A", `🎭 אני ${d.speakers.A}`],
            ["B", `🎭 אני ${d.speakers.B}`],
          ] as const
        ).map(([m, label]) => (
          <button key={m} onClick={() => startRole(m)} className={`rounded-xl py-2.5 transition ${mode === m ? "bg-card shadow-sm" : "text-muted"}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === "listen" ? (
        <button
          onClick={() => {
            if (playing.current) {
              playing.current = false;
              stopSpeaking();
              setActive(-1);
            } else playFrom(0);
          }}
          className="w-full rounded-2xl bg-brand py-3 font-bold text-brand-ink"
        >
          {active >= 0 ? "⏸ עצור" : "▶ השמע את כל השיחה"}
        </button>
      ) : (
        <p className="rounded-2xl bg-accent-soft p-3 text-sm">
          אתם משחקים את <b>{d.speakers[mode]}</b>. כשמגיע התור שלכם – נסו להגיד את המשפט בערבית לפי התרגום, ורק אז חשפו את התשובה.
        </p>
      )}

      <div className="space-y-3">
        {visible.map((line, i) => {
          const mine = mode !== "listen" && line.speaker === mode;
          const hidden = mine && !revealed[i];
          const left = line.speaker === "B";
          return (
            <div key={i} className={`pop flex ${left ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-3xl p-3.5 shadow-sm transition ${
                  left ? "rounded-tl-md bg-card" : "rounded-tr-md bg-brand-soft"
                } ${active === i ? "ring-2 ring-brand" : ""} ${mine ? "border-2 border-dashed border-accent" : "border border-line"}`}
              >
                <div className="mb-1 text-[11px] font-semibold text-muted">{d.speakers[line.speaker]}</div>
                {hidden ? (
                  <div className="space-y-2">
                    <div className="font-semibold">{line.he}</div>
                    <div className="text-xs text-muted">איך אומרים את זה בערבית? נסו בקול:</div>
                    <Pronounce target={line.ar} compact />
                    <button onClick={() => setRevealed((r) => ({ ...r, [i]: true }))} className="block text-sm font-semibold text-accent">
                      הצג את התשובה
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <SpeakButton text={line.ar} size="sm" />
                    <div>
                      <div className="ar text-2xl font-semibold">{line.ar}</div>
                      {settings.showTranslit && <div className="text-sm font-medium text-brand">{line.tr}</div>}
                      <div className="text-sm text-muted">{line.he}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      {mode !== "listen" && !finished && (
        <button onClick={() => setStep((s) => s + 1)} className="sticky bottom-24 w-full rounded-2xl bg-brand py-4 text-lg font-bold text-brand-ink shadow-lg">
          המשך ←
        </button>
      )}

      {(finished || mode === "listen") && (
        <button
          onClick={() => {
            sfx.done();
            completeLesson(`dialogue:${d.id}`, 100, [], 15);
          }}
          className="w-full rounded-2xl bg-good-soft py-4 font-bold text-good"
        >
          ✓ סיימתי את השיחה (+15 XP)
        </button>
      )}
    </main>
  );
}
