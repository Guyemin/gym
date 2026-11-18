import { notFound } from "next/navigation";
import { QUIZ_MODES } from "@/lib/quizzes";
import QuizRunner from "./QuizRunner";

export function generateStaticParams() {
  return QUIZ_MODES.map((m) => ({ mode: m.id }));
}

export default async function Page({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  if (!QUIZ_MODES.some((m) => m.id === mode)) notFound();
  return <QuizRunner mode={mode} />;
}
