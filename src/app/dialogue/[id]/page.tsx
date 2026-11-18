import { notFound } from "next/navigation";
import { DIALOGUES } from "@/data/speaking";
import DialogueView from "./DialogueView";

export function generateStaticParams() {
  return DIALOGUES.map((d) => ({ id: d.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = DIALOGUES.findIndex((d) => d.id === id);
  if (idx < 0) notFound();
  return <DialogueView index={idx} />;
}
