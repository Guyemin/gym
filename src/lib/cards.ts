import { LETTERS } from "@/data/letters";
import { READING } from "@/data/reading";
import { TOPICS } from "@/data/speaking";

export type CardContent = {
  id: string;
  ar: string;
  tr: string;
  he: string;
  kind: "letter" | "reading" | "phrase";
  note?: string;
};

export function topicCardIds(topicId: string) {
  const t = TOPICS.find((x) => x.id === topicId);
  return t ? t.phrases.map((_, i) => `p:${t.id}:${i}`) : [];
}

export function readingCardIds(lessonId: string) {
  const l = READING.find((x) => x.id === lessonId);
  return l ? l.items.map((_, i) => `r:${l.id}:${i}`) : [];
}

export function cardContent(id: string): CardContent | null {
  const [kind, a, b] = id.split(":");
  if (kind === "l") {
    const l = LETTERS.find((x) => x.id === a);
    return l ? { id, ar: l.char, tr: l.nameHe, he: `האות ${l.he}`, kind: "letter" } : null;
  }
  if (kind === "r") {
    const it = READING.find((x) => x.id === a)?.items[+b];
    return it ? { id, ...it, kind: "reading" } : null;
  }
  if (kind === "p") {
    const it = TOPICS.find((x) => x.id === a)?.phrases[+b];
    return it ? { id, ...it, kind: "phrase" } : null;
  }
  return null;
}
