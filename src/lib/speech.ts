"use client";

import { useCallback, useEffect, useRef, useState } from "react";

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const v = window.speechSynthesis.getVoices();
  if (v.length) cachedVoices = v;
  return cachedVoices;
}

export function arabicVoices() {
  return loadVoices().filter((v) => v.lang.toLowerCase().startsWith("ar"));
}

export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export type SpeakOpts = { rate?: number; voiceURI?: string; onEnd?: () => void };

export function speak(text: string, opts: SpeakOpts = {}) {
  if (!ttsSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = arabicVoices();
  const voice =
    voices.find((v) => v.voiceURI === opts.voiceURI) ??
    voices.find((v) => /ar[-_](JO|LB|PS|SY)/i.test(v.lang)) ??
    voices.find((v) => /ar[-_]SA/i.test(v.lang)) ??
    voices[0];
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "ar-SA";
  u.rate = opts.rate ?? 0.85;
  if (opts.onEnd) {
    u.onend = opts.onEnd;
    u.onerror = opts.onEnd;
  }
  synth.speak(u);
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/** Re-render when the browser finishes loading its voice list. */
export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!ttsSupported()) return;
    const update = () => setVoices(arabicVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);
  return voices;
}

/* ---------------- Speech recognition ---------------- */

type RecognitionResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
};

type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => Recognition) | null;
}

export function useRecognition(lang: string) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Recognition | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection after mount
    setSupported(!!getRecognitionCtor());
    return () => rec.current?.abort();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    stopSpeaking();
    rec.current?.abort();
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.continuous = false;
    setAlternatives([]);
    setError(null);
    r.onresult = (e) => {
      const res = e.results[0];
      const alts: string[] = [];
      for (let i = 0; i < res.length; i++) alts.push(res[i].transcript);
      setAlternatives(alts);
    };
    r.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "אין הרשאה למיקרופון. אפשרו גישה בהגדרות הדפדפן."
          : e.error === "no-speech"
            ? "לא שמעתי כלום. נסו שוב ודברו קרוב למיקרופון."
            : "משהו השתבש בזיהוי הדיבור. נסו שוב.",
      );
    };
    r.onend = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  }, [lang]);

  const stop = useCallback(() => rec.current?.stop(), []);

  return { supported, listening, alternatives, error, start, stop };
}
