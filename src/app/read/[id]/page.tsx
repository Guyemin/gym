import { notFound } from "next/navigation";
import { READING } from "@/data/reading";
import ReadingLessonView from "./ReadingLessonView";

export function generateStaticParams() {
  return READING.map((r) => ({ id: r.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = READING.findIndex((r) => r.id === id);
  if (idx < 0) notFound();
  return <ReadingLessonView index={idx} />;
}
