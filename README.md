# احكي · אִחְכִּי – לומדים ערבית

An app for Hebrew speakers learning Arabic: reading Arabic script and speaking colloquial Palestinian/Levantine Arabic.

## What's inside
- **Alphabet (אלפבית)** – all 28 letters taught in shape families. Each letter page covers its four positional forms, how to pronounce it, syllables you can tap to hear, example words, a tracing pad for writing practice and a microphone check.
- **Vowels (תנועות)** – the harakat (short vowels), sukun, shadda, tanween and long vowels.
- **Reading (קריאה)** – 9 graded lessons, going from first words to the definite article *al-*, short sentences, street signs, text without vowel marks and a short story. Each lesson has a learn mode and a read-aloud practice mode.
- **Spoken Arabic (ערבית מדוברת)** – 11 topics with Hebrew transliteration, notes on masculine and feminine forms, and a quiz for each topic.
- **Dialogues (שיחות)** – 4 everyday conversations. You can listen to the whole conversation or role-play one of the two speakers.
- **Practice (תרגול)** – 6 quiz modes plus spaced-repetition flashcards.
- XP, daily goal, streak and levels. Progress is saved in the browser's localStorage.

Audio uses the browser's built-in text-to-speech (Web Speech API). Pronunciation checking uses the browser's speech recognition, which works best in Chrome.

## Run locally
```bash
npm install
npm run dev
```

## Login and cloud progress (Supabase)
The app uses the Supabase environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. When they are set, every page requires login. When they are not set (for example in local dev), the app runs without login and keeps progress only in the browser.

1. Run `supabase/schema.sql` once in the Supabase SQL Editor.
2. In Supabase, go to Authentication → Sign In / Providers and turn off **Allow new users to sign up**.
3. Optional: in Vercel, set `ALLOWED_EMAILS` to your email address. Any other account is signed out and blocked.
4. To use the "email me a login link" option, add `https://<your-domain>/auth/callback` to the redirect URLs under Authentication → URL Configuration.

Progress is saved to the `arabic_progress` table about 1.5 seconds after each change, and again when you leave the app. When you come back to the app, it loads the newest version, so the same account works across devices.
