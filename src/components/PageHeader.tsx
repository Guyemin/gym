import Link from "next/link";
import { IconBack } from "./icons";

export default function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start gap-3">
      {back && (
        <Link
          href={back}
          aria-label="חזרה"
          className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line bg-card text-muted hover:text-ink"
        >
          <IconBack />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
