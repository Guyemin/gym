"use client";

import Link from "next/link";
import { LETTERS, LETTER_GROUPS, SPECIAL_SIGNS } from "@/data/letters";
import { useProgress } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import WordCard from "@/components/WordCard";
import { StatChips } from "@/components/Stats";

export default function AlphabetPage() {
  const p = useProgress();
  const done = LETTERS.filter((l) => p.letters[l.id]).length;
  return (
    <main>
      <PageHeader title="האלפבית הערבי" subtitle={`28 אותיות · למדת ${done}`} right={<StatChips />} />

      <div className="mb-5 rounded-2xl bg-brand-soft p-4 text-sm leading-relaxed">
        <b>איך זה עובד?</b> ערבית נכתבת מימין לשמאל, כמו עברית. רוב האותיות מתחברות זו לזו ומשנות מעט את צורתן לפי
        המיקום במילה (תחילה, אמצע, סוף). הרבה אותיות נבדלות רק בנקודות – לכן לומדים אותן ב<b>משפחות</b>.
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2">
        <Link href="/practice/letters" className="rounded-2xl bg-brand p-3 text-center font-bold text-brand-ink">
          ⚡ חידון אותיות
        </Link>
        <Link href="/vowels" className="rounded-2xl border border-line bg-card p-3 text-center font-bold">
          ◌َ תנועות (חרכאת)
        </Link>
      </div>

      <div className="space-y-6">
        {LETTER_GROUPS.map((g) => (
          <section key={g.id}>
            <h2 className="font-bold">{g.title}</h2>
            <p className="mb-2 text-xs text-muted">{g.desc}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {LETTERS.filter((l) => l.group === g.id).map((l) => (
                <Link
                  key={l.id}
                  href={`/alphabet/${l.id}`}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 transition hover:border-brand ${
                    p.letters[l.id] ? "border-brand/40 bg-brand-soft" : "border-line bg-card"
                  }`}
                >
                  {p.letters[l.id] && <span className="absolute left-1.5 top-1 text-xs text-brand">✓</span>}
                  {l.difficulty === 3 && <span className="absolute right-1.5 top-1 size-1.5 rounded-full bg-accent" title="צליל שאין בעברית" />}
                  <span className="ar text-4xl leading-none">{l.char}</span>
                  <span className="mt-1 text-[11px] text-muted">{l.nameHe}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <span className="size-1.5 rounded-full bg-accent" /> = צליל שלא קיים בעברית, דורש תרגול מיוחד
      </p>

      <section className="mt-8">
        <h2 className="mb-1 text-xl font-bold">סימנים מיוחדים</h2>
        <p className="mb-3 text-sm text-muted">אותיות וצורות נוספות שתפגשו בכל טקסט</p>
        <div className="space-y-4">
          {SPECIAL_SIGNS.map((s) => (
            <div key={s.char} className="rounded-3xl border border-line bg-card-2 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="ar grid size-14 place-items-center rounded-2xl bg-card text-4xl">{s.char}</span>
                <div>
                  <div className="font-bold">{s.he}</div>
                  <div className="ar text-sm text-muted">{s.name}</div>
                </div>
              </div>
              <p className="mb-3 text-sm leading-relaxed">{s.desc}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {s.examples.map((e) => (
                  <WordCard key={e.ar} {...e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
