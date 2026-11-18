"use client";

import Link from "next/link";
import { LONG_VOWELS, VOWELS } from "@/data/vowels";
import { speak } from "@/lib/speech";
import { useProgress } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import WordCard from "@/components/WordCard";

export default function VowelsPage() {
  const { settings } = useProgress();
  const say = (t: string) => speak(t, { rate: settings.rate, voiceURI: settings.voiceURI });
  return (
    <main className="space-y-6">
      <PageHeader title="תנועות – حَرَكَات" subtitle="הניקוד של הערבית" back="/alphabet" />

      <div className="rounded-2xl bg-brand-soft p-4 text-sm leading-relaxed">
        כמו בעברית, בערבית כותבים בעיקר עיצורים. התנועות הקצרות מסומנות בסימנים קטנים מעל ומתחת לאות – ה<b>חרכאת</b>.
        בספרי לימוד, בקוראן ובספרי ילדים הן מופיעות; בעיתונים ובשלטים – כמעט אף פעם. כדי ללמוד לקרוא מתחילים <b>עם</b> ניקוד.
      </div>

      <Link href="/practice/vowels" className="block rounded-2xl bg-brand p-3 text-center font-bold text-brand-ink">
        ⚡ חידון תנועות
      </Link>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">תנועות קצרות וסימנים</h2>
        {VOWELS.map((v) => (
          <div key={v.id} className="rounded-3xl border border-line bg-card p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => say(v.sign)}
                className="ar grid size-20 shrink-0 place-items-center rounded-2xl bg-card-2 text-5xl transition hover:bg-brand-soft active:scale-95"
              >
                {v.sign}
              </button>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold">{v.nameHe}</span>
                  <span className="ar text-lg text-muted">{v.name}</span>
                </div>
                <div className="font-semibold text-brand">{v.sound}</div>
                <p className="text-sm text-muted">{v.desc}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {v.examples.map((e) => (
                <WordCard key={e.ar} {...e} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">תנועות ארוכות</h2>
        <p className="text-sm text-muted">
          האותיות ا, و, י משמשות גם כ״אמות קריאה״ – הן מאריכות את התנועה. ההבדל בין קצר לארוך משנה משמעות!
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LONG_VOWELS.map((v) => (
            <button key={v.sign} onClick={() => say(v.sign)} className="rounded-2xl border border-line bg-card p-3 text-center hover:border-brand">
              <div className="ar text-4xl">{v.sign}</div>
              <div className="text-sm font-semibold text-brand">{v.sound}</div>
              <div className="text-xs text-muted">{v.desc}</div>
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {LONG_VOWELS.flatMap((v) => v.examples).map((e) => (
            <WordCard key={e.ar} {...e} />
          ))}
        </div>
      </section>

      <Link href="/read" className="block rounded-2xl bg-accent-soft p-4 text-center font-bold text-accent">
        מוכנים? בואו נתחיל לקרוא ←
      </Link>
    </main>
  );
}
