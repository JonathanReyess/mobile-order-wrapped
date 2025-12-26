export interface Theme {
  id: string;
  label: string;
  pageBg: string;
  cardBg: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderColor: string;
  dividerColor: string;
  barColor: string;
  buttonBg: string;
  sticker1: string;
  sticker2: string;
}

export const THEMES: Theme[] = [
  {
    id: "deepocean",
    label: "Deep Ocean",
    pageBg: "bg-[#001f3f]",
    cardBg: "bg-[#003366]",
    textColor: "text-blue-50",
    subTextColor: "text-blue-200/60",
    accentColor: "text-[#40e0d0]",
    borderColor: "border-[#FFFFFF]",
    dividerColor: "bg-[#004d99]",
    barColor: "bg-[#1e90ff]",
    buttonBg: "bg-[#005a9c] text-white hover:bg-[#007acc]",
    sticker1: "bg-[#004d99]/80 border-white/10 text-white",
    sticker2: "bg-[#004d99]/80 border-white/10 text-white",
  },
  {
    id: "noir",
    label: "Noir",
    pageBg: "bg-[#0a0a0a]",
    cardBg: "bg-[#111111]",
    textColor: "text-zinc-100",
    subTextColor: "text-zinc-500",
    accentColor: "text-white",
    borderColor: "border-zinc-800",
    dividerColor: "bg-zinc-800",
    barColor: "bg-zinc-100",
    buttonBg: "bg-zinc-100 text-black hover:bg-zinc-200",
    sticker1: "bg-zinc-800 border-zinc-700 text-white",
    sticker2: "bg-zinc-800 border-zinc-700 text-white",
  },
  {
    id: "midnight",
    label: "Midnight",
    pageBg: "bg-slate-900",
    cardBg: "bg-[#55508d]",
    textColor: "text-indigo-50",
    subTextColor: "text-indigo-300",
    accentColor: "text-indigo-400",
    borderColor: "border-slate-700",
    dividerColor: "bg-indigo-700",
    barColor: "bg-indigo-500",
    buttonBg: "bg-indigo-500 text-white hover:bg-indigo-400",
    sticker1: "bg-[#55508d]/80 border-indigo-400/20 text-white",
    sticker2: "bg-[#55508d]/80 border-indigo-400/20 text-white",
  },
  {
    id: "matcha",
    label: "Matcha Latte",
    pageBg: "bg-[#c0cfb2]",
    cardBg: "bg-[#44624a]",
    textColor: "text-white",
    subTextColor: "text-[#b3c6a9]",
    accentColor: "text-[#b3c6a9]",
    borderColor: "border-[#44624a]",
    dividerColor: "bg-[#587e6c]",
    barColor: "bg-[#7aa08a]",
    buttonBg: "bg-[#7aa08a] text-white hover:bg-[#587e6c]",
    sticker1: "bg-[#587e6c]/80 border-white/10 text-white",
    sticker2: "bg-[#587e6c]/80 border-white/10 text-white",
  },
  {
    id: "hojicha",
    label: "Hojicha Roast",
    pageBg: "bg-[#dac1a7]",
    cardBg: "bg-[#8b4513]",
    textColor: "text-[#f1ece6]",
    subTextColor: "text-[#d2b48c]",
    accentColor: "text-[#d2b48c]",
    borderColor: "border-[#d2b48c]",
    dividerColor: "bg-[#a0522d]",
    barColor: "bg-[#a0522d]",
    buttonBg: "bg-[#a0522d] text-white hover:bg-[#8b4513]",
    sticker1: "bg-[#a0522d]/80 border-[#f1ece6]/30 text-white",
    sticker2: "bg-[#a0522d]/80 border-[#f1ece6]/30 text-white",
  },
];
