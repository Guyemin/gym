import { LETTERS, letterForms } from "@/data/letters";
import { READING } from "@/data/reading";
import { TOPICS } from "@/data/speaking";
import { stripHarakat } from "@/lib/arabic";
import { readingCardIds, topicCardIds } from "@/lib/cards";
import { sample, shuffle } from "@/lib/sfx";
import type { Question } from "@/components/Quiz";

export type QuizMode = {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  make: () => Question[];
};

const N = 10;

function lettersQuiz(): Question[] {
  return sample(LETTERS, N).map((l, n) => {
    const others = sample(LETTERS.filter((o) => o.id !== l.id), 3);
    if (n % 2 === 0) {
      return {
        id: `l:${l.id}`,
        instruction: "איזו אות זו?",
        prompt: <div className="ar text-8xl leading-none">{l.char}</div>,
        options: shuffle([l, ...others]).map((o) => ({ key: o.id, label: `${o.he} · ${o.nameHe}` })),
        answer: l.id,
        explain: <span>{l.sound}</span>,
      };
    }
    return {
      id: `l:${l.id}`,
      instruction: `מצאו את האות ${l.nameHe} (כמו ${l.he})`,
      audio: l.name,
      prompt: <div className="text-3xl font-bold">{l.nameHe}</div>,
      options: shuffle([l, ...others]).map((o) => ({ key: o.id, label: o.char, arabic: true })),
      answer: l.id,
    };
  });
}

function formsQuiz(): Question[] {
  const connecting = LETTERS.filter((l) => l.connects);
  return sample(connecting, N).map((l) => {
    const forms = letterForms(l);
    const which = shuffle(["initial", "medial", "final"] as const)[0];
    const label = { initial: "בתחילת מילה", medial: "באמצע מילה", final: "בסוף מילה" }[which];
    const others = sample(LETTERS.filter((o) => o.id !== l.id), 3);
    return {
      id: `l:${l.id}`,
      instruction: `האות הזו מופיעה ${label}. איזו אות היא?`,
      prompt: <div className="ar text-8xl leading-none">{forms[which]}</div>,
      options: shuffle([l, ...others]).map((o) => ({ key: o.id, label: o.char, arabic: true })),
      answer: l.id,
      explain: (
        <span>
          זו האות {l.nameHe} ({l.he}). כל הצורות: <span className="ar text-xl">{Object.values(forms).join("  ")}</span>
        </span>
      ),
    };
  });
}

const VOWEL_MARKS = [
  { mark: "َ", he: "ַ", name: "פתחה" },
  { mark: "ِ", he: "ִ", name: "כסרה" },
  { mark: "ُ", he: "ֻ", name: "צ'מה" },
  { mark: "ْ", he: "ְ", name: "סוכון" },
];

function heWithVowel(he: string, v: string) {
  // put the niqqud right after the first Hebrew letter (before a geresh/dagesh)
  return he[0] + v + he.slice(1).replace("ּ", "");
}

function vowelsQuiz(): Question[] {
  const letters = LETTERS.filter((l) => l.id !== "alif" && !l.he.includes("'"));
  return Array.from({ length: N }, () => {
    const l = sample(letters, 1)[0];
    const v = sample(VOWEL_MARKS, 1)[0];
    return {
      instruction: "איך קוראים את ההברה?",
      prompt: <div className="ar text-8xl leading-none">{l.char + v.mark}</div>,
      audio: v.mark === "ْ" ? undefined : l.char + v.mark,
      options: VOWEL_MARKS.map((o) => ({ key: o.name, label: `${heWithVowel(l.he, o.he)}  (${o.name})` })),
      answer: v.name,
    };
  });
}

function allReading() {
  return READING.flatMap((r) => r.items.map((it, i) => ({ ...it, id: readingCardIds(r.id)[i], vowelled: r.vowelled })));
}

function readingQuiz(): Question[] {
  const all = allReading().filter((x) => !x.ar.includes(" "));
  return sample(all, N).map((w) => {
    const others = sample(all.filter((o) => o.tr !== w.tr), 3);
    return {
      id: w.id,
      instruction: "איך קוראים את המילה?",
      prompt: <div className="ar text-6xl">{w.vowelled ? w.ar : stripHarakat(w.ar)}</div>,
      options: shuffle([w, ...others]).map((o) => ({ key: o.tr, label: o.tr })),
      answer: w.tr,
      explain: <span>משמעות: {w.he}</span>,
    };
  });
}

function listeningQuiz(): Question[] {
  const all = allReading().filter((x) => !x.ar.includes(" "));
  return sample(all, N).map((w) => {
    const others = sample(all.filter((o) => o.ar !== w.ar), 3);
    return {
      id: w.id,
      instruction: "הקשיבו – איזו מילה שמעתם?",
      audio: w.ar,
      prompt: <div className="text-6xl">🎧</div>,
      options: shuffle([w, ...others]).map((o) => ({ key: o.ar, label: o.ar, arabic: true })),
      answer: w.ar,
      explain: (
        <span>
          {w.tr} – {w.he}
        </span>
      ),
    };
  });
}

function phrasesQuiz(): Question[] {
  const all = TOPICS.flatMap((t) => t.phrases.map((p, i) => ({ ...p, id: topicCardIds(t.id)[i] })));
  return sample(all, N).map((ph, n) => {
    const others = sample(all.filter((o) => o.he !== ph.he && o.ar !== ph.ar), 3);
    if (n % 2) {
      return {
        id: ph.id,
        instruction: "מה המשמעות?",
        prompt: (
          <div>
            <div className="ar text-4xl">{ph.ar}</div>
            <div className="text-brand">{ph.tr}</div>
          </div>
        ),
        options: shuffle([ph, ...others]).map((o) => ({ key: o.ar, label: o.he })),
        answer: ph.ar,
      };
    }
    return {
      id: ph.id,
      instruction: "איך אומרים בערבית מדוברת?",
      prompt: <div className="text-2xl font-bold">{ph.he}</div>,
      options: shuffle([ph, ...others]).map((o) => ({ key: o.ar, label: o.tr })),
      answer: ph.ar,
      explain: <span className="ar text-xl">{ph.ar}</span>,
    };
  });
}

export const QUIZ_MODES: QuizMode[] = [
  { id: "letters", title: "זיהוי אותיות", desc: "רואים אות – בוחרים מה היא, ולהפך", emoji: "🔤", make: lettersQuiz },
  { id: "forms", title: "צורות אותיות", desc: "זיהוי אות בתחילת, אמצע וסוף מילה", emoji: "🧩", make: formsQuiz },
  { id: "vowels", title: "תנועות", desc: "קריאת הברות עם חרכאת", emoji: "◌َ", make: vowelsQuiz },
  { id: "reading", title: "קריאת מילים", desc: "קוראים מילה ובוחרים את התעתיק", emoji: "📖", make: readingQuiz },
  { id: "listening", title: "הבנת הנשמע", desc: "שומעים מילה ומוצאים אותה כתובה", emoji: "🎧", make: listeningQuiz },
  { id: "phrases", title: "ביטויים מדוברים", desc: "תרגום ביטויים מכל הנושאים", emoji: "💬", make: phrasesQuiz },
];
