import type { Example } from "./letters";

export type Vowel = {
  id: string;
  sign: string; // shown on a ب
  name: string;
  nameHe: string;
  sound: string;
  desc: string;
  examples: Example[];
};

export const VOWELS: Vowel[] = [
  {
    id: "fatha", sign: "بَ", name: "فَتْحَة", nameHe: "פַתְחַה", sound: "a – בַּ",
    desc: "קו קטן מעל האות. כמו פתח/קמץ בעברית.",
    examples: [{ ar: "كَتَبَ", tr: "כַּתַבַּ", he: "הוא כתב" }, { ar: "وَلَد", tr: "וַלַד", he: "ילד" }],
  },
  {
    id: "kasra", sign: "بِ", name: "كَسْرَة", nameHe: "כַּסְרַה", sound: "i – בִּ",
    desc: "קו קטן מתחת לאות. כמו חיריק בעברית.",
    examples: [{ ar: "بِنْت", tr: "בִּנְת", he: "ילדה" }, { ar: "مِن", tr: "מִן", he: "מ-" }],
  },
  {
    id: "damma", sign: "بُ", name: "ضَمَّة", nameHe: "צ'ַמַּה", sound: "u – בֻּ",
    desc: "וו קטנה מעל האות. כמו קובוץ/שורוק קצר.",
    examples: [{ ar: "خُبْز", tr: "ח'ֻבְּז", he: "לחם" }, { ar: "أُمّ", tr: "אֻם", he: "אמא" }],
  },
  {
    id: "sukun", sign: "بْ", name: "سُكُون", nameHe: "סֻכּוּן", sound: "בלי תנועה – בְּ",
    desc: "עיגול קטן מעל האות – האות 'שקטה', בלי תנועה. כמו שווא נח.",
    examples: [{ ar: "بَحْر", tr: "בַּחְר", he: "ים" }, { ar: "شَمْس", tr: "שַמְס", he: "שמש" }],
  },
  {
    id: "shadda", sign: "بّ", name: "شَدَّة", nameHe: "שַדַּה", sound: "הכפלה – בּבּ",
    desc: "סימן כמו w קטנה מעל האות – האות נהגית פעמיים (מוכפלת). כמו דגש חזק.",
    examples: [{ ar: "حُبّ", tr: "חֻבּ", he: "אהבה" }, { ar: "تُفَّاح", tr: "תֻפַּאח", he: "תפוחים" }],
  },
  {
    id: "tanwin-a", sign: "بًا", name: "تَنْوِين فَتْح", nameHe: "תַנְוִין פַתְח", sound: "an – בַּן",
    desc: "שני קווים מעל – תנועה + נ' בסוף מילה. בדרך כלל באה עם א' בסוף.",
    examples: [{ ar: "شُكْرًا", tr: "שֻכְּרַן", he: "תודה" }, { ar: "أَهْلًا", tr: "אַהְלַן", he: "אהלן / ברוך הבא" }],
  },
  {
    id: "tanwin-i", sign: "بٍ", name: "تَنْوِين كَسْر", nameHe: "תַנְוִין כַּסְר", sound: "in – בִּן",
    desc: "שני קווים מתחת – i + נ' בסוף מילה.",
    examples: [{ ar: "بَيْتٍ", tr: "בֵּיתִן", he: "בית (יחסה)" }],
  },
  {
    id: "tanwin-u", sign: "بٌ", name: "تَنْوِين ضَمّ", nameHe: "תַנְוִין צ'ַם", sound: "un – בֻּן",
    desc: "שתי וו קטנות מעל – u + נ' בסוף מילה.",
    examples: [{ ar: "كِتَابٌ", tr: "כִּתַאבֻּן", he: "ספר (כלשהו)" }],
  },
];

export const LONG_VOWELS: { sign: string; sound: string; desc: string; examples: Example[] }[] = [
  {
    sign: "بَا", sound: "aa – בַּא",
    desc: "פתחה + א' = a ארוכה",
    examples: [{ ar: "بَاب", tr: "בַּאבּ", he: "דלת" }, { ar: "نَار", tr: "נַאר", he: "אש" }],
  },
  {
    sign: "بِي", sound: "ii – בִּי",
    desc: "כסרה + י' = i ארוכה",
    examples: [{ ar: "فِيل", tr: "פִיל", he: "פיל" }, { ar: "كَبِير", tr: "כַּבִּיר", he: "גדול" }],
  },
  {
    sign: "بُو", sound: "uu – בּוּ",
    desc: "צ'מה + ו' = u ארוכה",
    examples: [{ ar: "نُور", tr: "נוּר", he: "אור" }, { ar: "سُوق", tr: "סוּק", he: "שוק" }],
  },
];

export const SUN_LETTERS = "تثدذرزسشصضطظلن";
