"use client";

import { useEffect, useState } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  not_allowed: "לחשבון הזה אין גישה לאפליקציה.",
  link_failed: "קישור ההתחברות לא תקין או שפג תוקפו. נסו שוב.",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    try {
      const saved = localStorage.getItem("arabic-login-email");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore saved email after mount
      if (saved) setEmail(saved);
    } catch {}
    if (code) setError(ERRORS[code] ?? "משהו השתבש. נסו שוב.");
  }, []);

  const remember = () => {
    try {
      localStorage.setItem("arabic-login-email", email);
    } catch {}
  };

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    remember();
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "אימייל או סיסמה שגויים" : error.message);
      setLoading(false);
      return;
    }
    window.location.href = "/";
  }

  async function sendLink() {
    if (!email) return setError("הכניסו אימייל קודם");
    setLoading(true);
    setError(null);
    remember();
    const { error } = await createClient().auth.signInWithOtp({
      email,
      // never creates new accounts – only existing users can log in
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError("לא ניתן לשלוח קישור לאימייל הזה.");
    else setInfo("שלחנו לך קישור התחברות למייל 📬");
  }

  if (!supabaseConfigured) {
    return <p className="py-20 text-center text-muted">ההתחברות לא מוגדרת בסביבה הזו.</p>;
  }

  return (
    <main className="mx-auto max-w-sm pt-10">
      <div className="text-center">
        <div className="ar text-6xl font-bold text-brand">احكي</div>
        <p className="mt-1 text-muted">אִחְכִּי · לומדים ערבית</p>
      </div>

      <form onSubmit={login} className="mt-8 space-y-3 rounded-3xl border border-line bg-card p-5 shadow-sm">
        <h1 className="text-lg font-bold">התחברות</h1>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="אימייל"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg p-3 text-left"
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="סיסמה"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg p-3 text-left"
        />
        {error && <p className="rounded-xl bg-bad-soft p-2.5 text-sm text-bad">{error}</p>}
        {info && <p className="rounded-xl bg-good-soft p-2.5 text-sm text-good">{info}</p>}
        <button disabled={loading || !password} className="w-full rounded-xl bg-brand py-3 font-bold text-brand-ink disabled:opacity-50">
          {loading ? "רגע…" : "כניסה"}
        </button>
        <button type="button" onClick={sendLink} disabled={loading} className="w-full rounded-xl bg-card-2 py-3 text-sm font-semibold">
          שכחתי סיסמה – שלחו לי קישור למייל
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-muted">🔒 אפליקציה פרטית – ההתקדמות נשמרת בחשבון שלך</p>
    </main>
  );
}
