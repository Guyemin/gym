import type { Metadata, Viewport } from "next";
import { Rubik, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const rubik = Rubik({ subsets: ["hebrew", "latin"], variable: "--font-rubik" });
const naskh = Noto_Naskh_Arabic({ subsets: ["arabic"], variable: "--font-naskh", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "אִחְכִּי · احكي – לומדים ערבית",
  description: "לומדים לקרוא ולדבר ערבית: אלפבית, קריאה, ערבית מדוברת, תרגול הגייה וחזרות.",
  appleWebApp: { capable: true, title: "אחכי", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#101716" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${naskh.variable}`}>
      <body className="min-h-dvh antialiased">
        <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
