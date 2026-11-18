"use client";

import { useState } from "react";
import { speak } from "@/lib/speech";
import { useProgress } from "@/lib/store";
import { IconSpeaker } from "./icons";

export default function SpeakButton({
  text,
  size = "md",
  slow = false,
  className = "",
  label,
}: {
  text: string;
  size?: "sm" | "md" | "lg";
  slow?: boolean;
  className?: string;
  label?: string;
}) {
  const { settings } = useProgress();
  const [playing, setPlaying] = useState(false);
  const dims = size === "lg" ? "size-14" : size === "sm" ? "size-8" : "size-10";
  const icon = size === "lg" ? "size-7" : size === "sm" ? "size-4" : "size-5";
  return (
    <button
      type="button"
      aria-label={label ?? "השמע"}
      onClick={(e) => {
        e.stopPropagation();
        setPlaying(true);
        speak(text, {
          rate: slow ? Math.max(0.4, settings.rate - 0.35) : settings.rate,
          voiceURI: settings.voiceURI,
          onEnd: () => setPlaying(false),
        });
        setTimeout(() => setPlaying(false), 6000);
      }}
      className={`grid shrink-0 place-items-center rounded-full transition active:scale-95 ${dims} ${
        playing ? "bg-brand text-brand-ink" : "bg-brand-soft text-brand hover:bg-brand hover:text-brand-ink"
      } ${className}`}
    >
      {label && size === "lg" ? <span className="sr-only">{label}</span> : null}
      <IconSpeaker className={icon} />
    </button>
  );
}
