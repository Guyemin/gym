import { notFound } from "next/navigation";
import { LETTERS } from "@/data/letters";
import LetterDetail from "./LetterDetail";

export function generateStaticParams() {
  return LETTERS.map((l) => ({ id: l.id }));
}

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = LETTERS.findIndex((l) => l.id === id);
  if (idx < 0) notFound();
  return <LetterDetail index={idx} />;
}
