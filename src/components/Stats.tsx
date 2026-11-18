"use client";

import { level, useProgress } from "@/lib/store";
import { IconFlame, IconStar } from "./icons";

export function StatChips() {
  const p = useProgress();
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold">
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-accent">
        <IconFlame className="size-4" />
        {p.streak}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-brand">
        <IconStar className="size-4" />
        {p.xp}
      </span>
    </div>
  );
}

export function DailyRing() {
  const p = useProgress();
  const goal = p.settings.dailyGoal;
  const pct = Math.min(1, p.todayXp / goal);
  const { lvl, into, need } = level(p.xp);
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-brand p-5 text-brand-ink shadow-lg">
      <div className="relative size-24 shrink-0">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle cx="40" cy="40" r={r} className="fill-none stroke-current opacity-20" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r={r}
            className="fill-none stroke-current transition-all duration-700"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xl font-bold leading-none tabular-nums">{p.todayXp}</div>
            <div className="text-[10px] opacity-80" dir="ltr">/ {goal} XP</div>
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="text-lg font-bold">{pct >= 1 ? "עמדת ביעד היומי! 🎉" : "היעד היומי שלך"}</div>
        <div className="flex gap-4 text-sm">
          <div>
            <div className="text-2xl font-bold leading-none">🔥 {p.streak}</div>
            <div className="opacity-80">ימים ברצף</div>
          </div>
          <div>
            <div className="text-2xl font-bold leading-none">⭐ {lvl}</div>
            <div className="opacity-80">רמה</div>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-current" style={{ width: `${(into / need) * 100}%` }} />
        </div>
        <div className="text-[11px] opacity-80">
          {need - into} XP לרמה {lvl + 1}
        </div>
      </div>
    </div>
  );
}
