import { t } from '@/lib/i18n/translations'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">{t.brand}</h1>
          <p className="text-zinc-400 mt-1 text-sm">{t.tagline}</p>
        </div>
        {children}
      </div>
    </main>
  )
}
