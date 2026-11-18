"use client";

import { useEffect, useState } from "react";
import { similarity } from "@/lib/arabic";
import { useRecognition } from "@/lib/speech";
import { addXp, useProgress } from "@/lib/store";
import { IconMic } from "./icons";

/** Record the learner and compare what the browser heard with the target text. */
export default function Pronounce({ target, compact = false }: { target: string; compact?: boolean }) {
  const { settings } = useProgress();
  const { supported, listening, alternatives, error, start, stop } = useRecognition(settings.recLang);
  const [awarded, setAwarded] = useState(false);

  const best = alternatives.reduce(
    (acc, alt) => {
      const s = similarity(target, alt);
      return s > acc.score ? { score: s, text: alt } : acc;
    },
    { score: -1, text: "" },
  );
  const hasResult = alternatives.length > 0;

  useEffect(() => {
    if (hasResult && best.score >= 70 && !awarded) {
      addXp(3);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time reward flag
      setAwarded(true);
    }
  }, [hasResult, best.score, awarded]);

  if (!supported) {
    return compact ? null : (
      <p className="rounded-xl bg-card-2 p-3 text-xs text-muted">
        תרגול הגייה עם מיקרופון זמין ב-Chrome (מחשב ואנדרואיד) ובספארי. בדפדפן הזה אפשר להקשיב ולחזור בקול.
      </p>
    );
  }

  const verdict =
    best.score >= 85
      ? { text: "מצוין! הגייה נהדרת", cls: "bg-good-soft text-good", emoji: "🎉" }
      : best.score >= 65
        ? { text: "כמעט! עוד ניסיון קטן", cls: "bg-accent-soft text-accent", emoji: "👏" }
        : { text: "בואו ננסה שוב – הקשיבו ונסו לחקות", cls: "bg-bad-soft text-bad", emoji: "🔁" };

  return (
    <div className={compact ? "" : "space-y-2"}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (listening) stop();
          else start();
        }}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
          listening ? "listening bg-bad text-white" : "bg-card-2 text-ink hover:bg-line"
        }`}
      >
        <IconMic className="size-4" />
        {listening ? "מקשיב… דברו עכשיו" : compact ? "נסו להגיד" : "נסו להגיד בקול"}
      </button>
      {error && <p className="text-xs text-bad">{error}</p>}
      {hasResult && !listening && (
        <div className={`pop mt-2 rounded-xl p-3 text-sm ${verdict.cls}`}>
          <div className="flex items-center justify-between gap-2 font-semibold">
            <span>
              {verdict.emoji} {verdict.text}
            </span>
            <span className="tabular-nums">{best.score}%</span>
          </div>
          <div className="mt-1 text-xs opacity-80">
            שמעתי: <span className="ar text-base">{best.text || "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
