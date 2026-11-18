"use client";

import { QUIZ_MODES } from "@/lib/quizzes";
import { completeLesson } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import Quiz from "@/components/Quiz";

export default function QuizRunner({ mode }: { mode: string }) {
  const m = QUIZ_MODES.find((x) => x.id === mode)!;
  return (
    <main>
      <PageHeader title={`${m.emoji} ${m.title}`} subtitle={m.desc} back="/practice" />
      <Quiz make={m.make} backHref="/practice" onFinish={(s) => completeLesson(`quiz:${m.id}`, s, [], 10)} />
    </main>
  );
}
