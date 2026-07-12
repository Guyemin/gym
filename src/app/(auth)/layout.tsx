import { t } from '@/lib/i18n/translations'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url('/gym-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            {t.brand}
          </h1>
          <p className="text-orange-400 mt-2 text-sm font-medium tracking-wide uppercase">{t.tagline}</p>
        </div>
        {children}
      </div>
    </main>
  )
}
