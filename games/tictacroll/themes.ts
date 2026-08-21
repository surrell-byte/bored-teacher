export interface TicTacRollTheme {
  id: string;
  name: string;
  bg: string;
  surface: string;
  sand: string;
  accent: string;
  accent2: string;
  glow: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  shadow: string;
  xColor: string;
  oColor: string;
  ok: string;
}

export const TIC_TAC_ROLL_THEMES: TicTacRollTheme[] = [
  { id: "kalahari", name: "Kalahari Dawn", bg: "#FFF4D7", surface: "#FFE9BE", sand: "#E8B260", accent: "#FFBE3B", accent2: "#F07A2F", glow: "rgba(255,190,59,0.35)", card: "#FFE9BE", text: "#3B2A18", muted: "#8a7355", border: "rgba(224,164,74,0.35)", shadow: "0 8px 30px rgba(184,120,40,0.18)", xColor: "#3AB8FF", oColor: "#F07A2F", ok: "#42C97B" },
  { id: "mirage", name: "Sunset Mirage", bg: "#FFE6B3", surface: "#FFD9A0", sand: "#FFB95A", accent: "#FF7F4D", accent2: "#FF4D8D", glow: "rgba(255,79,141,0.32)", card: "#FFDEB0", text: "#503042", muted: "#8a5e6e", border: "rgba(166,94,255,0.3)", shadow: "0 8px 30px rgba(255,79,141,0.18)", xColor: "#A65EFF", oColor: "#FF7F4D", ok: "#FFB95A" },
  { id: "night", name: "Desert Night", bg: "#101928", surface: "#1E273B", sand: "#2A3550", accent: "#2D9CDB", accent2: "#8A5CFF", glow: "rgba(255,216,110,0.25)", card: "#1E273B", text: "#F7F7F7", muted: "#8b93a8", border: "rgba(138,92,255,0.35)", shadow: "0 8px 30px rgba(0,0,0,0.5)", xColor: "#2D9CDB", oColor: "#FFD86E", ok: "#4BE88B" },
  { id: "emerald", name: "Emerald Oasis", bg: "#FFF7E2", surface: "#FDEFCB", sand: "#E9C46A", accent: "#43AA8B", accent2: "#2E7D63", glow: "rgba(67,170,139,0.3)", card: "#FBEBC6", text: "#1f3d33", muted: "#6c8a7e", border: "rgba(67,170,139,0.3)", shadow: "0 8px 30px rgba(46,125,99,0.18)", xColor: "#57C7FF", oColor: "#43AA8B", ok: "#43AA8B" },
  { id: "crystal", name: "Crystal Dunes", bg: "#FFFDF8", surface: "#FFF4DE", sand: "#FFC857", accent: "#8B5CF6", accent2: "#FF5FA2", glow: "rgba(139,92,246,0.3)", card: "#FFF1D6", text: "#3a2a4d", muted: "#8d7fa3", border: "rgba(139,92,246,0.3)", shadow: "0 8px 30px rgba(139,92,246,0.18)", xColor: "#53D8FB", oColor: "#FF944D", ok: "#8B5CF6" },
  { id: "fire", name: "Fire & Sand", bg: "#FFF7D6", surface: "#FFEBB0", sand: "#B9782A", accent: "#F97316", accent2: "#EF4444", glow: "rgba(249,115,22,0.32)", card: "#FFE7A8", text: "#3a1d0a", muted: "#a37c56", border: "rgba(185,120,42,0.35)", shadow: "0 8px 30px rgba(185,120,42,0.2)", xColor: "#EF4444", oColor: "#FACC15", ok: "#F97316" },
  { id: "rainbow", name: "Rainbow Adventure", bg: "#FFFDF7", surface: "#FFF4E8", sand: "#FFD93D", accent: "#4DA3FF", accent2: "#8B5CF6", glow: "rgba(255,105,180,0.3)", card: "#FFF0DE", text: "#2a2036", muted: "#8a7fa0", border: "rgba(139,92,246,0.3)", shadow: "0 8px 30px rgba(255,159,67,0.2)", xColor: "#4DA3FF", oColor: "#FF9F43", ok: "#4CD964" },
  { id: "dice", name: "Magic Dice", bg: "#FFF9EE", surface: "#FFF1D2", sand: "#FFC83D", accent: "#59C6FF", accent2: "#8A5CFF", glow: "rgba(89,198,255,0.32)", card: "#FFF0CE", text: "#2e2a1c", muted: "#948a6e", border: "rgba(138,92,255,0.3)", shadow: "0 8px 30px rgba(138,92,255,0.18)", xColor: "#59C6FF", oColor: "#FFC83D", ok: "#8A5CFF" },
  { id: "ancient", name: "Ancient Desert", bg: "#EFE3C8", surface: "#E6D6AE", sand: "#D9A441", accent: "#46C6D8", accent2: "#C65D3B", glow: "rgba(70,198,216,0.3)", card: "#E8DAB4", text: "#3a2e18", muted: "#8c7c56", border: "rgba(156,122,77,0.35)", shadow: "0 8px 30px rgba(156,122,77,0.2)", xColor: "#46C6D8", oColor: "#EFC75E", ok: "#46C6D8" },
  { id: "neon", name: "Neon Oasis", bg: "#6ED8FF", surface: "#FFFDF7", sand: "#F8C75D", accent: "#9B5BFF", accent2: "#FF5DA8", glow: "rgba(155,91,255,0.35)", card: "#FFFDF7", text: "#1c2a3a", muted: "#5c7a94", border: "rgba(155,91,255,0.3)", shadow: "0 8px 30px rgba(58,213,255,0.25)", xColor: "#3AD5FF", oColor: "#FF8C3A", ok: "#79F24D" },
];
