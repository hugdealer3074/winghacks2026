// frontend-mobile/theme.ts

export const COLORS = {
  primary: "#A083F9",       // soft periwinkle
  primaryHard: "#5A1FC1",   // border/strong purple
  primarySoft: "#DED2FF",   // light lavender
  background: "#FFFBF9",    // snow
  card: "#FFFFFF",
  text: "#222222",
  textSecondary: "#C9C9C9",
  border: "rgba(34, 34, 34, 0.10)",
  success: "#22C55E",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
};

export const SHADOW = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2, // Android
  },
};

export const TYPE = {
  h1: { fontSize: 28, fontWeight: "800" as const },
  h2: { fontSize: 22, fontWeight: "800" as const },
  h3: { fontSize: 18, fontWeight: "700" as const },
  body: { fontSize: 16, fontWeight: "500" as const },
  bodySmall: { fontSize: 14, fontWeight: "500" as const },
  caption: { fontSize: 12, fontWeight: "600" as const },
};