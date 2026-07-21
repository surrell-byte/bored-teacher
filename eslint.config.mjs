import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Dependency direction: Engine -> SDK -> Games -> App, never the reverse.
// `hooks/`, `config/`, `types/`, `lib/`, `constants/` are a shared foundation
// layer beneath all of that — anything may depend on them, so they're not
// restricted here. See engine/ARCHITECTURE.md for the full rationale.
const upwardFromEngine = [
  "@/games", "@/games/*",
  "@/features", "@/features/*",
  "@/app", "@/app/*",
  "@/components", "@/components/*",
  "@/providers", "@/providers/*",
  "@/store", "@/store/*",
];
const upwardFromGames = [
  "@/features", "@/features/*",
  "@/app", "@/app/*",
  "@/components", "@/components/*",
  "@/providers", "@/providers/*",
  "@/store", "@/store/*",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["engine/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: upwardFromEngine.map((group) => ({
          group: [group],
          message: "engine/ is the innermost layer (Engine -> SDK -> Games -> App) — it must not import from anything above it.",
        })),
      }],
    },
  },
  {
    files: ["games/**/*.{ts,tsx,jsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: upwardFromGames.map((group) => ({
          group: [group],
          message: "games/ sits below app/features (Engine -> SDK -> Games -> App) — it must not import from either.",
        })),
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
