"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { TOPICS } from "@/data/speaking";
import { topicCardIds } from "@/lib/cards";
import { sample, shuffle } from "@/lib/sfx";
import { completeLesson } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import Quiz, { type Question } from "@/components/Quiz";
import WordCard from "@/components/WordCard";

export default function TopicView({ index }: { index: number }) {
  const topic = TOPICS[index];
  const next = TOPICS[index + 1];
  const [quiz, setQuiz] = useState(false);
  const ids = topicCardIds(topic.id);

  const make = useCallback((): Question[] => {
    const all = topic.phrases.map((ph, i) => ({ ...ph, id: ids[i] }));
    return sample(all, Math.min(8, all.length)).map((ph, n) => {
      const others = sample(all.filter((o) => o.ar !== ph.ar && o.he !== ph.he), 3);
      if (n % 2 === 0) {
        // Hebrew -> pick the Arabic phrase (with sound)
        return {
          id: ph.id,
          instruction: "איך אומרים בערבית?",
          prompt: <div className="text-2xl font-bold">{ph.he}</div>,
          options: shuffle([ph, ...others]).map((o) => ({
            key: o.ar,
            label: (
              <span className="flex flex-col">
                <span className="ar text-xl">{o.ar}</span>
                <span className="text-xs font-normal text-muted">{o.tr}</span>
              </span>
            ),
          })),
          answer: ph.ar,
        };
      }
      // listen -> pick the meaning
      return {
        id: ph.id,
        instruction: "הקשיבו – מה המשמעות?",
        audio: ph.ar,
        prompt: <div className="text-5xl">🎧</div>,
        options: shuffle([ph, ...others]).map((o) => ({ key: o.ar, label: o.he })),
        answer: ph.ar,
        explain: (
          <span>
            <span className="ar text-xl">{ph.ar}</span> – {ph.tr}
          </span>
        ),
      };
    });
  }, [topic, ids]);

  return (
    <main className="space-y-5">
      <PageHeader title={`${topic.emoji} ${topic.title}`} subtitle={topic.desc} back="/speak" />
      {quiz ? (
        <Quiz make={make} backHref="/speak" onFinish={(s) => completeLesson(`speak:${topic.id}`, s, ids)} />
      ) : (
        <>
          {topic.tip && <p className="rounded-2xl bg-accent-soft p-4 text-sm leading-relaxed">💡 {topic.tip}</p>}
          <div className="space-y-2.5">
            {topic.phrases.map((ph) => (
              <WordCard key={ph.ar} {...ph} showBreakdown={false} />
            ))}
          </div>
          <button onClick={() => setQuiz(true)} className="sticky bottom-24 w-full rounded-2xl bg-brand py-4 text-lg font-bold text-brand-ink shadow-lg">
            ⚡ בוחן על הנושא
          </button>
          {next && (
            <Link href={`/speak/${next.id}`} className="block rounded-2xl border border-line bg-card p-3 text-center text-sm">
              הנושא הבא: <b>{next.emoji} {next.title}</b> ←
            </Link>
          )}
        </>
      )}
    </main>
  );
}
