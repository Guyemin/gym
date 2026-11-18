export type Example = { ar: string; tr: string; he: string };

export type Letter = {
  id: string;
  char: string;
  name: string; // Arabic name of the letter
  nameHe: string; // name in Hebrew letters
  he: string; // Hebrew equivalent
  sound: string; // pronunciation explanation in Hebrew
  connects: boolean; // does it connect to the following letter
  difficulty: 1 | 2 | 3; // 3 = sound that does not exist in Hebrew
  group: number; // lesson group
  examples: Example[];
};

export const LETTERS: Letter[] = [
  {
    id: "alif", char: "ا", name: "أَلِف", nameHe: "אַלִף", he: "א",
    sound: "נושאת את התנועה a ארוכה (אַא) או את ה-א בתחילת מילה. לא מתחברת לאות שאחריה.",
    connects: false, difficulty: 1, group: 1,
    examples: [
      { ar: "أَسَد", tr: "אַסַד", he: "אריה" },
      { ar: "بَاب", tr: "בַּאבּ", he: "דלת" },
    ],
  },
  {
    id: "ba", char: "ب", name: "بَاء", nameHe: "בַּאא", he: "בּ",
    sound: "כמו ב' דגושה בעברית. נקודה אחת מתחת.",
    connects: true, difficulty: 1, group: 1,
    examples: [
      { ar: "بَيْت", tr: "בֵּית", he: "בית" },
      { ar: "كِتَاب", tr: "כִּתַאבּ", he: "ספר" },
    ],
  },
  {
    id: "ta", char: "ت", name: "تَاء", nameHe: "תַאא", he: "ת",
    sound: "כמו ת' בעברית. שתי נקודות מעל.",
    connects: true, difficulty: 1, group: 1,
    examples: [
      { ar: "تُفَّاح", tr: "תֻפַּאח", he: "תפוחים" },
      { ar: "بِنْت", tr: "בִּנְת", he: "ילדה / בת" },
    ],
  },
  {
    id: "tha", char: "ث", name: "ثَاء", nameHe: "ת'אא", he: "ת'",
    sound: "כמו th באנגלית במילה think – הלשון בין השיניים. בערבית המדוברת נהגית לרוב ת' או ס'. שלוש נקודות מעל.",
    connects: true, difficulty: 2, group: 1,
    examples: [
      { ar: "ثَلَاثَة", tr: "ת'לַאת'ה", he: "שלושה" },
      { ar: "ثَوْب", tr: "ת'וֹבּ", he: "בגד / גלימה" },
    ],
  },
  {
    id: "jim", char: "ج", name: "جِيم", nameHe: "ג'ים", he: "ג'",
    sound: "כמו ג' במילה ג'ירפה. נקודה אחת בפנים.",
    connects: true, difficulty: 1, group: 2,
    examples: [
      { ar: "جَمَل", tr: "ג'מַל", he: "גמל" },
      { ar: "دَجَاج", tr: "דַג'אג'", he: "תרנגולות / עוף" },
    ],
  },
  {
    id: "ha", char: "ح", name: "حَاء", nameHe: "חַאא", he: "ח",
    sound: "ח' גרונית ועמוקה, כמו ח' של דוברי ערבית ותימנים – אוויר נדחף מאמצע הגרון, בלי חיכוך בחך. בלי נקודות.",
    connects: true, difficulty: 3, group: 2,
    examples: [
      { ar: "حُبّ", tr: "חֻבּ", he: "אהבה" },
      { ar: "بَحْر", tr: "בַּחְר", he: "ים" },
    ],
  },
  {
    id: "kha", char: "خ", name: "خَاء", nameHe: "ח'אא", he: "ח'",
    sound: "כמו ח' או כ' רפה בעברית הרגילה (ישראלית). נקודה אחת מעל.",
    connects: true, difficulty: 1, group: 2,
    examples: [
      { ar: "خُبْز", tr: "ח'ֻבְּז", he: "לחם" },
      { ar: "شَيْخ", tr: "שֵיח'", he: "שייח' / זקן" },
    ],
  },
  {
    id: "dal", char: "د", name: "دَال", nameHe: "דַאל", he: "ד",
    sound: "כמו ד' בעברית. לא מתחברת לאות שאחריה.",
    connects: false, difficulty: 1, group: 3,
    examples: [
      { ar: "دَار", tr: "דַאר", he: "בית / חצר" },
      { ar: "وَلَد", tr: "וַלַד", he: "ילד" },
    ],
  },
  {
    id: "dhal", char: "ذ", name: "ذَال", nameHe: "ד'אל", he: "ד'",
    sound: "כמו th באנגלית במילה this – הלשון בין השיניים, צליל קולי. במדוברת נהגית לרוב ד' או ז'. נקודה מעל.",
    connects: false, difficulty: 2, group: 3,
    examples: [
      { ar: "ذَهَب", tr: "ד'הַבּ", he: "זהב" },
      { ar: "أُذُن", tr: "אֻד'ֻן", he: "אוזן" },
    ],
  },
  {
    id: "ra", char: "ر", name: "رَاء", nameHe: "רַאא", he: "ר",
    sound: "ר' מתגלגלת – קצה הלשון רוטט מאחורי השיניים העליונות (כמו בספרדית). לא מתחברת לאות שאחריה.",
    connects: false, difficulty: 2, group: 3,
    examples: [
      { ar: "رَأْس", tr: "רַאְס", he: "ראש" },
      { ar: "نَار", tr: "נַאר", he: "אש" },
    ],
  },
  {
    id: "zay", char: "ز", name: "زَاي", nameHe: "זַאי", he: "ז",
    sound: "כמו ז' בעברית. נקודה מעל. לא מתחברת לאות שאחריה.",
    connects: false, difficulty: 1, group: 3,
    examples: [
      { ar: "زَيْت", tr: "זֵית", he: "שמן" },
      { ar: "مَوْز", tr: "מוֹז", he: "בננות" },
    ],
  },
  {
    id: "sin", char: "س", name: "سِين", nameHe: "סִין", he: "ס",
    sound: "כמו ס' בעברית.",
    connects: true, difficulty: 1, group: 4,
    examples: [
      { ar: "سَمَك", tr: "סַמַכּ", he: "דגים" },
      { ar: "سَلَام", tr: "סַלַאם", he: "שלום" },
    ],
  },
  {
    id: "shin", char: "ش", name: "شِين", nameHe: "שִין", he: "ש",
    sound: "כמו ש' בעברית. שלוש נקודות מעל.",
    connects: true, difficulty: 1, group: 4,
    examples: [
      { ar: "شَمْس", tr: "שַמְס", he: "שמש" },
      { ar: "شَاي", tr: "שַאי", he: "תה" },
    ],
  },
  {
    id: "sad", char: "ص", name: "صَاد", nameHe: "צַאד", he: "צ",
    sound: "ס' 'כבדה' (מוגבהת) – כמו ס' אבל עם הלשון נמוכה וחלל פה רחב, והתנועות סביבה נשמעות עמוקות יותר. לא כמו צ' העברית!",
    connects: true, difficulty: 3, group: 4,
    examples: [
      { ar: "صَبَاح", tr: "צַבַּאח", he: "בוקר" },
      { ar: "صَدِيق", tr: "צַדִיק", he: "חבר" },
    ],
  },
  {
    id: "dad", char: "ض", name: "ضَاد", nameHe: "צ'אד", he: "צ'",
    sound: "ד' 'כבדה' – כמו ד' עם חלל פה רחב ועמוק. ערבית נקראת 'שפת הצ'אד' כי הצליל ייחודי לה. נקודה מעל.",
    connects: true, difficulty: 3, group: 4,
    examples: [
      { ar: "ضَوْء", tr: "צ'וֹא", he: "אור" },
      { ar: "بَيْض", tr: "בֵּיצ'", he: "ביצים" },
    ],
  },
  {
    id: "taa", char: "ط", name: "طَاء", nameHe: "טַאא", he: "ט",
    sound: "ת' 'כבדה' – כמו ת' עם חלל פה רחב. התנועות סביבה נשמעות כהות יותר.",
    connects: true, difficulty: 3, group: 5,
    examples: [
      { ar: "طَالِب", tr: "טַאלֵבּ", he: "תלמיד / סטודנט" },
      { ar: "قِطّ", tr: "קִטּ", he: "חתול" },
    ],
  },
  {
    id: "zaa", char: "ظ", name: "ظَاء", nameHe: "ט'אא", he: "ט'",
    sound: "ד' (ذ) 'כבדה' – th של this עם חלל פה רחב. במדוברת נהגית לרוב כמו צ' (ض) או ז' כבדה. נקודה מעל.",
    connects: true, difficulty: 3, group: 5,
    examples: [
      { ar: "ظَهْر", tr: "ט'הְר", he: "גב / צהריים" },
      { ar: "نَظَّارَة", tr: "נַט'ַּארַה", he: "משקפיים" },
    ],
  },
  {
    id: "ain", char: "ع", name: "عَيْن", nameHe: "עֵין", he: "ע",
    sound: "ע' גרונית אמיתית – כיווץ של שרירי הגרון האמצעי, כמו ע' של דוברי ערבית ותימנים. נסו להגיד 'אַ' תוך כדי כיווץ הגרון.",
    connects: true, difficulty: 3, group: 6,
    examples: [
      { ar: "عَيْن", tr: "עֵין", he: "עין" },
      { ar: "عَرَبِيّ", tr: "עַרַבִּי", he: "ערבי / ערבית" },
    ],
  },
  {
    id: "ghain", char: "غ", name: "غَيْن", nameHe: "ע'ֵין", he: "ע'",
    sound: "כמו ר' העברית הישראלית (ר' גרונית). נקודה מעל.",
    connects: true, difficulty: 1, group: 6,
    examples: [
      { ar: "غُرْفَة", tr: "ע'ֻרְפַה", he: "חדר" },
      { ar: "صَغِير", tr: "צַע'ִיר", he: "קטן" },
    ],
  },
  {
    id: "fa", char: "ف", name: "فَاء", nameHe: "פַאא", he: "פ",
    sound: "תמיד פ' רפה (f). אין צליל p בערבית. נקודה אחת מעל.",
    connects: true, difficulty: 1, group: 7,
    examples: [
      { ar: "فِيل", tr: "פִיל", he: "פיל" },
      { ar: "فَم", tr: "פַם", he: "פה" },
    ],
  },
  {
    id: "qaf", char: "ق", name: "قَاف", nameHe: "קַאף", he: "ק",
    sound: "ק' עמוקה מאחורי הגרון (ליד הענבל). בערבית המדוברת בערים נהגית כמו א' (עצירה), ובכפרים לפעמים כ'. שתי נקודות מעל.",
    connects: true, difficulty: 2, group: 7,
    examples: [
      { ar: "قَلْب", tr: "קַלְבּ", he: "לב" },
      { ar: "قَمَر", tr: "קַמַר", he: "ירח" },
    ],
  },
  {
    id: "kaf", char: "ك", name: "كَاف", nameHe: "כַּאף", he: "כּ",
    sound: "כמו כ' דגושה (k).",
    connects: true, difficulty: 1, group: 8,
    examples: [
      { ar: "كَلْب", tr: "כַּלְבּ", he: "כלב" },
      { ar: "كَبِير", tr: "כַּבִּיר", he: "גדול" },
    ],
  },
  {
    id: "lam", char: "ل", name: "لَام", nameHe: "לַאם", he: "ל",
    sound: "כמו ל' בעברית.",
    connects: true, difficulty: 1, group: 8,
    examples: [
      { ar: "لَيْل", tr: "לֵיל", he: "לילה" },
      { ar: "لَيْمُون", tr: "לֵימוּן", he: "לימון" },
    ],
  },
  {
    id: "mim", char: "م", name: "مِيم", nameHe: "מִים", he: "מ",
    sound: "כמו מ' בעברית.",
    connects: true, difficulty: 1, group: 8,
    examples: [
      { ar: "مَاء", tr: "מַאא", he: "מים" },
      { ar: "مَدْرَسَة", tr: "מַדְרַסַה", he: "בית ספר" },
    ],
  },
  {
    id: "nun", char: "ن", name: "نُون", nameHe: "נוּן", he: "נ",
    sound: "כמו נ' בעברית. נקודה אחת מעל.",
    connects: true, difficulty: 1, group: 9,
    examples: [
      { ar: "نُور", tr: "נוּר", he: "אור" },
      { ar: "عِنَب", tr: "עִנַבּ", he: "ענבים" },
    ],
  },
  {
    id: "haa", char: "ه", name: "هَاء", nameHe: "הַאא", he: "ה",
    sound: "ה' נשמעת וברורה – גם בסוף מילה צריך לשמוע את הנשיפה.",
    connects: true, difficulty: 1, group: 9,
    examples: [
      { ar: "هِلَال", tr: "הִלַאל", he: "סהר" },
      { ar: "وَجْه", tr: "וַג'ְה", he: "פנים" },
    ],
  },
  {
    id: "waw", char: "و", name: "وَاو", nameHe: "וַאו", he: "ו",
    sound: "w כמו במילה 'וואו', או תנועה u ארוכה (וּ). לא מתחברת לאות שאחריה.",
    connects: false, difficulty: 1, group: 9,
    examples: [
      { ar: "وَرْدَة", tr: "וַרְדַה", he: "ורד / פרח" },
      { ar: "يَوْم", tr: "יוֹם", he: "יום" },
    ],
  },
  {
    id: "ya", char: "ي", name: "يَاء", nameHe: "יַאא", he: "י",
    sound: "כמו י' בעברית, או תנועה i ארוכה (אִי). שתי נקודות מתחת.",
    connects: true, difficulty: 1, group: 9,
    examples: [
      { ar: "يَد", tr: "יַד", he: "יד" },
      { ar: "كُرْسِيّ", tr: "כֻּרְסִי", he: "כיסא" },
    ],
  },
];

export const LETTER_GROUPS: { id: number; title: string; desc: string }[] = [
  { id: 1, title: "משפחת הבּ", desc: "א, ב, ת, ת' – אותה צורה, ההבדל בנקודות" },
  { id: 2, title: "משפחת הג'", desc: "ג', ח, ח' – צורת 'וו' עם נקודה בפנים, בלי, או מעל" },
  { id: 3, title: "האותיות הבודדות", desc: "ד, ד', ר, ז – לא מתחברות לאות שאחריהן" },
  { id: 4, title: "שיניים ובטן", desc: "ס, ש, צ, צ'" },
  { id: 5, title: "האותיות הכבדות", desc: "ט, ט'" },
  { id: 6, title: "משפחת העין", desc: "ע, ע'" },
  { id: 7, title: "פ ו-ק", desc: "פ (נקודה אחת), ק (שתי נקודות)" },
  { id: 8, title: "כ, ל, מ", desc: "אותיות שימושיות מאוד" },
  { id: 9, title: "נ, ה, ו, י", desc: "סיום האלפבית" },
];

const ZWJ = "‍";

/** Positional forms using zero-width joiners so the browser shapes them. */
export function letterForms(l: Letter) {
  return {
    isolated: l.char,
    initial: l.connects ? l.char + ZWJ : l.char,
    medial: ZWJ + l.char + (l.connects ? ZWJ : ""),
    final: ZWJ + l.char,
  };
}

export const SPECIAL_SIGNS: { char: string; name: string; he: string; desc: string; examples: Example[] }[] = [
  {
    char: "ء", name: "هَمْزَة", he: "הַמְזה",
    desc: "עצירה קצרה בגרון (כמו א' בהגייה מדויקת של 'מאאוד'). יכולה לשבת על א, ו, י או לבד.",
    examples: [
      { ar: "سُؤَال", tr: "סֻאַאל", he: "שאלה" },
      { ar: "سَمَاء", tr: "סַמַאא", he: "שמיים" },
    ],
  },
  {
    char: "ة", name: "تَاء مَرْبُوطَة", he: "תַאא מַרְבּוּטַה",
    desc: "'ת' קשורה' – מופיעה רק בסוף מילה, בדרך כלל מסמנת נקבה. נהגית כמו ה' (a) בסוף מילה, וכ-ת' כשהמילה סמוכה.",
    examples: [
      { ar: "مَدْرَسَة", tr: "מַדְרַסַה", he: "בית ספר" },
      { ar: "قِطَّة", tr: "קִטַּה", he: "חתולה" },
    ],
  },
  {
    char: "ى", name: "أَلِف مَقْصُورَة", he: "אַלִף מַקְצוּרַה",
    desc: "נראית כמו י' בלי נקודות, מופיעה בסוף מילה ונהגית a ארוכה.",
    examples: [
      { ar: "عَلَى", tr: "עַלַא", he: "על" },
      { ar: "مُسْتَشْفَى", tr: "מֻסְתַשְפַא", he: "בית חולים" },
    ],
  },
  {
    char: "لا", name: "لَام أَلِف", he: "לַאם אַלִף",
    desc: "כשל' באה לפני א, הן מתחברות לצורה מיוחדת. נקרא 'לָא'.",
    examples: [
      { ar: "لَا", tr: "לַא", he: "לא" },
      { ar: "سَلَام", tr: "סַלַאם", he: "שלום" },
    ],
  },
  {
    char: "آ", name: "أَلِف مَدَّة", he: "אַלִף מַדַּה",
    desc: "א' עם 'מדה' (גל) מעליה – נהגית אַא ארוכה בתחילת מילה.",
    examples: [
      { ar: "آسِف", tr: "אַאסֵף", he: "מצטער" },
      { ar: "قُرْآن", tr: "קֻרְאַאן", he: "קוראן" },
    ],
  },
];
