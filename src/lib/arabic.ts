import { LETTERS } from "@/data/letters";

const HARAKAT = /[ً-ٰٟۖ-ۭـ]/g;

export function stripHarakat(s: string) {
  return s.replace(HARAKAT, "");
}

/** Normalization used to compare speech recognition output with the target. */
export function normalize(s: string) {
  return stripHarakat(s)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "")
    .replace(/[^ء-ي\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return dp[a.length][b.length];
}

/** 0..100 similarity between two Arabic strings after normalization. */
export function similarity(target: string, heard: string) {
  const a = normalize(target).replace(/\s/g, "");
  const b = normalize(heard).replace(/\s/g, "");
  if (!a.length) return 0;
  const d = levenshtein(a, b);
  return Math.max(0, Math.round((1 - d / Math.max(a.length, b.length)) * 100));
}

const EXTRA: Record<string, { name: string; he: string }> = {
  "ء": { name: "הַמְזה", he: "א (עצירה)" },
  "أ": { name: "אַלִף + הַמְזה", he: "א" },
  "إ": { name: "אַלִף + הַמְזה מתחת", he: "אִ" },
  "آ": { name: "אַלִף מַדַּה", he: "אַא" },
  "ٱ": { name: "אַלִף וַצְלַה", he: "א (שקטה)" },
  "ؤ": { name: "וַאו + הַמְזה", he: "א" },
  "ئ": { name: "יַאא + הַמְזה", he: "א" },
  "ة": { name: "תַאא מַרְבּוּטַה", he: "ה / ת" },
  "ى": { name: "אַלִף מַקְצוּרַה", he: "א" },
};

const byChar = new Map(LETTERS.map((l) => [l.char, l]));

export type Piece = { char: string; display: string; name: string; he: string; id?: string };

/** Split a word into base letters (keeping their harakat for display). */
export function breakdown(word: string): Piece[] {
  const out: Piece[] = [];
  for (const ch of word) {
    if (/[ً-ٰٟ]/.test(ch)) {
      if (out.length) out[out.length - 1].display += ch;
      continue;
    }
    const l = byChar.get(ch);
    if (l) out.push({ char: ch, display: ch, name: l.nameHe, he: l.he, id: l.id });
    else if (EXTRA[ch]) out.push({ char: ch, display: ch, ...EXTRA[ch] });
  }
  return out;
}

export const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export function toArabicDigits(n: number | string) {
  return String(n).replace(/\d/g, (d) => AR_DIGITS[+d]);
}
