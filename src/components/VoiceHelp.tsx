"use client";

import { useEffect, useState } from "react";
import { speak, useNoArabicVoice } from "@/lib/speech";
import { useProgress } from "@/lib/store";

/** Explains how to get Arabic audio working on the device. */
export default function VoiceHelp({ always = false }: { always?: boolean }) {
  const { settings } = useProgress();
  const missing = useNoArabicVoice();
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- platform detection after mount
    setIos(/iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document));
    try {
      setHidden(localStorage.getItem("voice-help-hidden") === "1");
    } catch {}
  }, []);

  if (!always && (!missing || hidden)) return null;

  return (
    <div className="rounded-2xl border border-accent/40 bg-accent-soft p-4 text-sm leading-relaxed">
      <div className="font-bold">{missing ? "🔇 לא נמצא קול ערבי במכשיר" : "🔊 לא שומעים קול?"}</div>
      {ios ? (
        <ol className="mt-1 list-inside list-decimal space-y-0.5">
          <li>
            בדקו ש<b>מתג השקט</b> בצד האייפון לא דלוק (פס כתום) – הוא משתיק את ההקראה. העלו גם את הווליום.
          </li>
          <li>
            התקינו קול ערבי: <b>הגדרות ← נגישות ← תוכן מוקרא ← קולות ← ערבית</b> ← הורידו את הקול (למשל Maged).
          </li>
          <li>סגרו את האפליקציה לגמרי ופתחו מחדש.</li>
        </ol>
      ) : (
        <ol className="mt-1 list-inside list-decimal space-y-0.5">
          <li>העלו את ווליום המדיה.</li>
          <li>
            התקינו קול ערבי: <b>הגדרות ← ניהול כללי / נגישות ← המרת טקסט לדיבור (פלט טקסט לדיבור) ← מנוע Google ← הגדרות ←
            התקנת נתוני קול ← ערבית</b>.
          </li>
          <li>אם אין מנוע של Google – התקינו את &quot;Speech Services by Google&quot; מחנות Play.</li>
          <li>סגרו את הדפדפן לגמרי ופתחו מחדש.</li>
        </ol>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => speak("مَرْحَبا", { rate: settings.rate, voiceURI: settings.voiceURI })}
          className="rounded-full bg-brand px-4 py-1.5 font-semibold text-brand-ink"
        >
          ▶ בדיקת קול
        </button>
        {!always && (
          <button
            onClick={() => {
              setHidden(true);
              try {
                localStorage.setItem("voice-help-hidden", "1");
              } catch {}
            }}
            className="rounded-full bg-card px-4 py-1.5"
          >
            הסתר
          </button>
        )}
      </div>
    </div>
  );
}
