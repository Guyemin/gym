"use client";

import { useState } from "react";
import { speak, useVoices } from "@/lib/speech";
import { resetProgress, setSettings, useProgress } from "@/lib/store";
import PageHeader from "@/components/PageHeader";

const REC_LANGS = [
  { v: "ar-JO", label: "ירדנית (הכי קרוב לפלסטינית)" },
  { v: "ar-LB", label: "לבנונית" },
  { v: "ar-PS", label: "פלסטינית" },
  { v: "ar-EG", label: "מצרית" },
  { v: "ar-SA", label: "סעודית / ספרותית" },
];

export default function SettingsPage() {
  const p = useProgress();
  const s = p.settings;
  const voices = useVoices();
  const [confirm, setConfirm] = useState(false);

  return (
    <main className="space-y-4">
      <PageHeader title="הגדרות" back="/" />

      <Card title="🔊 השמעה">
        <label className="block text-sm">
          מהירות דיבור: <b>{s.rate.toFixed(2)}</b>
          <input
            type="range"
            min={0.5}
            max={1.2}
            step={0.05}
            value={s.rate}
            onChange={(e) => setSettings({ rate: +e.target.value })}
            className="mt-2 w-full accent-[var(--brand)]"
          />
        </label>
        <label className="mt-3 block text-sm">
          קול
          <select
            value={s.voiceURI}
            onChange={(e) => setSettings({ voiceURI: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-card p-2.5"
          >
            <option value="">אוטומטי</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>
        {voices.length === 0 && (
          <p className="mt-2 rounded-xl bg-accent-soft p-3 text-xs leading-relaxed">
            לא נמצא קול ערבי במכשיר. באייפון: הגדרות ← נגישות ← תוכן מוקרא ← קולות ← ערבית. באנדרואיד: הגדרות ← המרת טקסט לדיבור ←
            התקנת נתוני קול ← ערבית.
          </p>
        )}
        <button
          onClick={() => speak("مَرْحَبا، كِيفَك؟", { rate: s.rate, voiceURI: s.voiceURI })}
          className="mt-3 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand"
        >
          ▶ בדיקת קול
        </button>
      </Card>

      <Card title="🎙️ זיהוי דיבור">
        <label className="block text-sm">
          ניב לזיהוי
          <select
            value={s.recLang}
            onChange={(e) => setSettings({ recLang: e.target.value })}
            className="mt-1 w-full rounded-xl border border-line bg-card p-2.5"
          >
            {REC_LANGS.map((l) => (
              <option key={l.v} value={l.v}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs text-muted">הזיהוי נעשה על ידי הדפדפן (מומלץ Chrome). הציון הוא הערכה – לא שיפוט מושלם.</p>
      </Card>

      <Card title="📝 תצוגה ויעדים">
        <label className="flex items-center justify-between text-sm">
          הצג תעתיק עברי
          <input
            type="checkbox"
            checked={s.showTranslit}
            onChange={(e) => setSettings({ showTranslit: e.target.checked })}
            className="size-5 accent-[var(--brand)]"
          />
        </label>
        <div className="mt-3 text-sm">יעד יומי</div>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {[15, 30, 50, 80].map((g) => (
            <button
              key={g}
              onClick={() => setSettings({ dailyGoal: g })}
              className={`rounded-xl py-2 text-sm font-semibold ${s.dailyGoal === g ? "bg-brand text-brand-ink" : "bg-card-2"}`}
            >
              {g} XP
            </button>
          ))}
        </div>
      </Card>

      <Card title="📊 ההתקדמות שלי">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-card-2 p-2">
            <div className="text-xl font-bold">{p.xp}</div>XP
          </div>
          <div className="rounded-xl bg-card-2 p-2">
            <div className="text-xl font-bold">{Object.keys(p.letters).length}</div>אותיות
          </div>
          <div className="rounded-xl bg-card-2 p-2">
            <div className="text-xl font-bold">{Object.keys(p.cards).length}</div>כרטיסיות
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">ההתקדמות נשמרת בדפדפן הזה במכשיר הזה.</p>
        {confirm ? (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                resetProgress();
                setConfirm(false);
              }}
              className="flex-1 rounded-xl bg-bad py-2 text-sm font-bold text-white"
            >
              כן, למחוק הכל
            </button>
            <button onClick={() => setConfirm(false)} className="flex-1 rounded-xl bg-card-2 py-2 text-sm">
              ביטול
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} className="mt-3 text-sm font-semibold text-bad">
            איפוס התקדמות
          </button>
        )}
      </Card>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <h2 className="mb-3 font-bold">{title}</h2>
      {children}
    </section>
  );
}
