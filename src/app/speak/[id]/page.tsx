import { notFound } from "next/navigation";
import { TOPICS } from "@/data/speaking";
import TopicView from "./TopicView";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ id: t.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = TOPICS.findIndex((t) => t.id === id);
  if (idx < 0) notFound();
  return <TopicView index={idx} />;
}
