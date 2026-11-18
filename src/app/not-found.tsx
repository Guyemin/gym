import Link from "next/link";

export default function NotFound() {
  return (
    <main className="py-20 text-center">
      <div className="ar text-6xl text-brand">؟</div>
      <p className="mt-4 font-semibold">הדף לא נמצא</p>
      <Link href="/" className="mt-4 inline-block rounded-full bg-brand px-6 py-2 font-bold text-brand-ink">
        לדף הבית
      </Link>
    </main>
  );
}
