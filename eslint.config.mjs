import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

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
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Keep the production build focused on actionable lint failures while the
    // existing JavaScript and JSX surfaces are migrated incrementally.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
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
