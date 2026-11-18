"use client";

import Link from "next/link";
import { DIALOGUES, TOPICS } from "@/data/speaking";
import { useProgress } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { StatChips } from "@/components/Stats";

export default function SpeakPage() {
  const p = useProgress();
  return (
    <main className="space-y-6">
      <PageHeader title="ערבית מדוברת" subtitle="מה שמדברים באמת ברחוב" right={<StatChips />} />

      <details className="rounded-2xl bg-brand-soft p-4 text-sm leading-relaxed">
        <summary className="cursor-pointer font-bold">איזו ערבית לומדים כאן?</summary>
        <p className="mt-2">
          בערבית יש פער גדול בין השפה הכתובה (<b>פֻצְחַא</b>, ספרותית) לבין השפה המדוברת (<b>עַאמִּיַּה</b>). כאן לומדים את
          הערבית המדוברת הלבנטינית-פלסטינית – זו שמדברים בישראל, ברשות הפלסטינית, בירדן, בלבנון ובסוריה.
        </p>
        <p className="mt-2">
          התעתיק בעברית הוא העיקר – כך באמת אומרים את המילים. הכתיב הערבי של המדוברת לא אחיד, וההשמעה הממוחשבת מבוססת על קול
          ערבי כללי, כך שלפעמים היא תישמע קצת ״ספרותית״.
        </p>
        <p className="mt-2">
          <b>שימו לב לזכר/נקבה:</b> בערבית פונים אחרת לגבר ולאישה – ראו את ההערות שמתחת לביטויים.
        </p>
      </details>

      <section>
        <h2 className="mb-3 text-lg font-bold">נושאים</h2>
        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map((t) => {
            const score = p.completed[`speak:${t.id}`];
            return (
              <Link
                key={t.id}
                href={`/speak/${t.id}`}
                className={`relative rounded-3xl border p-4 transition hover:border-brand ${
                  score !== undefined ? "border-brand/40 bg-brand-soft" : "border-line bg-card"
                }`}
              >
                {score !== undefined && (
                  <span className="absolute left-3 top-3 rounded-full bg-good px-2 py-0.5 text-[11px] font-bold text-white">{score}%</span>
                )}
                <div className="text-3xl">{t.emoji}</div>
                <div className="mt-2 font-bold leading-tight">{t.title}</div>
                <div className="mt-0.5 text-xs text-muted">{t.desc}</div>
                <div className="mt-1 text-[11px] text-muted">{t.phrases.length} ביטויים</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="dialogues" className="scroll-mt-4">
        <h2 className="mb-1 text-lg font-bold">שיחות</h2>
        <p className="mb-3 text-sm text-muted">שיחות אמיתיות מהחיים – הקשיבו, ואז שחקו תפקיד ודברו בעצמכם</p>
        <div className="space-y-2">
          {DIALOGUES.map((d) => (
            <Link key={d.id} href={`/dialogue/${d.id}`} className="flex items-center gap-4 rounded-3xl border border-line bg-card p-4 hover:border-brand">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-2xl">{d.emoji}</span>
              <div className="flex-1">
                <div className="font-bold">{d.title}</div>
                <div className="text-xs text-muted">{d.setting}</div>
              </div>
              {p.completed[`dialogue:${d.id}`] !== undefined && <span className="text-good">✓</span>}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
