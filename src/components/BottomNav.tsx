"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBolt, IconBook, IconChat, IconHome, IconLetters } from "./icons";

const ITEMS = [
  { href: "/", label: "בית", Icon: IconHome },
  { href: "/alphabet", label: "אותיות", Icon: IconLetters },
  { href: "/read", label: "קריאה", Icon: IconBook },
  { href: "/speak", label: "דיבור", Icon: IconChat },
  { href: "/practice", label: "תרגול", Icon: IconBolt },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-2xl">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href) || (href === "/practice" && path.startsWith("/review"));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                  active ? "text-brand" : "text-muted hover:text-ink"
                }`}
              >
                <span className={`rounded-full px-4 py-1 transition-colors ${active ? "bg-brand-soft" : ""}`}>
                  <Icon className="size-5" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
