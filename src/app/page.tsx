"use client";

import Link from "next/link";
import { LETTERS, LETTER_GROUPS } from "@/data/letters";
import { READING } from "@/data/reading";
import { DIALOGUES, TOPICS } from "@/data/speaking";
import { useDueCount, useProgress } from "@/lib/store";
import { DailyRing } from "@/components/Stats";
import { IconSettings } from "@/components/icons";

export default function Home() {
  const p = useProgress();
  const lettersDone = LETTERS.filter((l) => p.letters[l.id]).length;
  const readDone = READING.filter((r) => p.completed[`read:${r.id}`] !== undefined).length;
  const topicsDone = TOPICS.filter((t) => p.completed[`speak:${t.id}`] !== undefined).length;
  const dialoguesDone = DIALOGUES.filter((d) => p.completed[`dialogue:${d.id}`] !== undefined).length;
  const due = useDueCount();

  const nextLetter = LETTERS.find((l) => !p.letters[l.id]);
  const nextRead = READING.find((r) => p.completed[`read:${r.id}`] === undefined);
  const nextTopic = TOPICS.find((t) => p.completed[`speak:${t.id}`] === undefined);

  const next = nextLetter
    ? {
        href: `/alphabet/${nextLetter.id}`,
        kicker: `אלפבית · ${LETTER_GROUPS.find((g) => g.id === nextLetter.group)?.title}`,
        title: `האות ${nextLetter.nameHe}`,
        big: nextLetter.char,
      }
    : nextRead
      ? { href: `/read/${nextRead.id}`, kicker: "קריאה", title: nextRead.title, big: "اقرأ" }
      : nextTopic
        ? { href: `/speak/${nextTopic.id}`, kicker: "דיבור", title: nextTopic.title, big: nextTopic.emoji }
        : { href: "/practice", kicker: "תרגול", title: "סיימת את כל השיעורים! המשיכו לתרגל", big: "🏆" };

  return (
    <main className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <div className="ar text-3xl font-bold leading-tight text-brand">احكي</div>
          <h1 className="text-sm font-medium text-muted">אִחְכִּי · לומדים ערבית</h1>
        </div>
        <Link href="/settings" aria-label="הגדרות" className="grid size-10 place-items-center rounded-full border border-line bg-card text-muted">
          <IconSettings />
        </Link>
      </header>

      <DailyRing />

      <Link href={next.href} className="group flex items-center gap-4 rounded-3xl border border-line bg-card p-4 shadow-sm transition hover:border-brand">
        <div className="ar grid size-16 shrink-0 place-items-center rounded-2xl bg-accent-soft text-3xl font-bold text-accent">{next.big}</div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-accent">להמשיך מאיפה שעצרת · {next.kicker}</div>
          <div className="text-lg font-bold">{next.title}</div>
        </div>
        <span className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-ink group-hover:opacity-90">התחל</span>
      </Link>

      {due > 0 && (
        <Link href="/review" className="flex items-center gap-3 rounded-2xl bg-accent-soft p-4">
          <span className="text-2xl">🃏</span>
          <div className="flex-1">
            <div className="font-bold">{due} כרטיסיות מחכות לחזרה</div>
            <div className="text-sm text-muted">חזרה מרווחת שומרת את מה שלמדתם בזיכרון</div>
          </div>
          <span className="text-sm font-bold text-accent">לחזרה ←</span>
        </Link>
      )}

      <section className="grid grid-cols-2 gap-3">
        <SectionCard href="/alphabet" ar="أ ب ت" title="אלפבית" sub={`${lettersDone}/${LETTERS.length} אותיות`} pct={lettersDone / LETTERS.length} />
        <SectionCard href="/read" ar="اقرأ" title="קריאה" sub={`${readDone}/${READING.length} שיעורים`} pct={readDone / READING.length} />
        <SectionCard href="/speak" ar="احكي" title="ערבית מדוברת" sub={`${topicsDone}/${TOPICS.length} נושאים`} pct={topicsDone / TOPICS.length} />
        <SectionCard href="/speak#dialogues" ar="حوار" title="שיחות" sub={`${dialoguesDone}/${DIALOGUES.length} שיחות`} pct={dialoguesDone / DIALOGUES.length} />
      </section>

      <section className="grid grid-cols-3 gap-3">
        <MiniCard href="/vowels" emoji="بَ" title="תנועות" />
        <MiniCard href="/practice" emoji="⚡" title="תרגול" />
        <MiniCard href="/review" emoji="🃏" title="חזרה" />
      </section>
    </main>
  );
}

function SectionCard({ href, ar, title, sub, pct }: { href: string; ar: string; title: string; sub: string; pct: number }) {
  return (
    <Link href={href} className="relative overflow-hidden rounded-3xl border border-line bg-card p-4 shadow-sm transition hover:border-brand">
      <div className="ar text-3xl font-bold text-brand">{ar}</div>
      <div className="mt-1 font-bold">{title}</div>
      <div className="text-xs text-muted">{sub}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card-2">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct * 100}%` }} />
      </div>
    </Link>
  );
}

function MiniCard({ href, emoji, title }: { href: string; emoji: string; title: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-line bg-card p-3 text-center transition hover:border-brand">
      <div className="ar text-2xl">{emoji}</div>
      <div className="text-sm font-medium">{title}</div>
    </Link>
  );
}
