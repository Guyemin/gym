type P = { className?: string };
const base = "fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]";

export const IconHome = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
);
export const IconLetters = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M4 19V8a4 4 0 0 1 8 0v11M4 13h8M15 19h5M17.5 5v14" /></svg>
);
export const IconBook = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5M12 6c2-1.5 5-2 8-1.5V19c-3-.5-6 0-8 1.5M12 6v14.5" /></svg>
);
export const IconChat = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></svg>
);
export const IconBolt = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
);
export const IconSpeaker = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
);
export const IconMic = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
export const IconBack = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M9 6l6 6-6 6" /></svg>
);
export const IconCheck = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M5 12l5 5 9-10" /></svg>
);
export const IconX = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconFlame = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M12 22c4 0 7-2.7 7-7 0-4-3-6.5-4-10-2 1.5-3 3.5-3 5.5C11 9 10 8 9.5 6.5 7 9 5 11.5 5 15c0 4.3 3 7 7 7z" /></svg>
);
export const IconStar = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M12 3l2.8 5.8 6.2.8-4.6 4.3 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.6l6.2-.8z" /></svg>
);
export const IconSettings = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const IconPen = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
);
export const IconPlay = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`}><path d="M7 4v16l13-8z" /></svg>
);
