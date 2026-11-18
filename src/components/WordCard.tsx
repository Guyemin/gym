"use client";

import { useState } from "react";
import { stripHarakat } from "@/lib/arabic";
import { useProgress } from "@/lib/store";
import Breakdown from "./Breakdown";
import Pronounce from "./Pronounce";
import SpeakButton from "./SpeakButton";

export default function WordCard({
  ar,
  tr,
  he,
  note,
  big = false,
  hideVowels = false,
  showBreakdown = true,
}: {
  ar: string;
  tr: string;
  he: string;
  note?: string;
  big?: boolean;
  hideVowels?: boolean;
  showBreakdown?: boolean;
}) {
  const { settings } = useProgress();
  const [open, setOpen] = useState(false);
  const shown = hideVowels ? stripHarakat(ar) : ar;
  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <SpeakButton text={ar} />
        <button type="button" onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-right">
          <div className={`ar font-semibold ${big ? "text-4xl" : "text-3xl"}`}>{shown}</div>
          {settings.showTranslit && <div className="text-sm font-medium text-brand">{tr}</div>}
          <div className="text-sm text-muted">{he}</div>
        </button>
      </div>
      {note && <p className="mt-2 rounded-lg bg-accent-soft px-3 py-1.5 text-xs text-ink/80">💡 {note}</p>}
      {open && (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <SpeakButton text={ar} slow size="sm" label="השמע לאט" />
            <span className="text-xs text-muted">השמעה איטית</span>
          </div>
          {showBreakdown && <Breakdown word={ar} />}
          <Pronounce target={ar} />
        </div>
      )}
      {!open && <div className="mt-1 text-[11px] text-muted/70">הקישו לפירוק לאותיות ותרגול הגייה</div>}
    </div>
  );
}
