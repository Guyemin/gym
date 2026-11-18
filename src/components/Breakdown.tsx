"use client";

import Link from "next/link";
import { breakdown } from "@/lib/arabic";

export default function Breakdown({ word }: { word: string }) {
  const pieces = breakdown(word);
  return (
    <div className="pop flex flex-wrap gap-1.5" dir="rtl">
      {pieces.map((p, i) => {
        const inner = (
          <>
            <span className="ar text-2xl leading-none">{p.display}</span>
            <span className="text-[11px] text-muted">{p.name}</span>
            <span className="text-[11px] font-semibold text-brand">{p.he}</span>
          </>
        );
        const cls = "flex min-w-14 flex-col items-center gap-1 rounded-xl border border-line bg-card px-2 py-2";
        return p.id ? (
          <Link key={i} href={`/alphabet/${p.id}`} className={`${cls} hover:border-brand`} onClick={(e) => e.stopPropagation()}>
            {inner}
          </Link>
        ) : (
          <div key={i} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
