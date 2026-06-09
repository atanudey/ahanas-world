import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Static design mockups / prototypes — not imported, built, or typechecked.
    // They are kept as visual references only, so they are excluded from linting.
    "design.jsx",
    "theme/**/*.jsx",
  ]),
]);

export default eslintConfig;
