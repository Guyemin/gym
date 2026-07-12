import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { t, ADMIN_EMAIL } from '@/lib/i18n/translations'
import BottomNav from '@/components/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = user.email === ADMIN_EMAIL

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="border-b border-zinc-900 px-4 py-3 flex items-center justify-center">
        <span className="text-lg font-black text-white tracking-tight">{t.brand}</span>
      </header>
      {children}
      <BottomNav isAdmin={isAdmin} />
    </div>
  )
}
