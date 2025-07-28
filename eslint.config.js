import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  { ignores: ["dist", ".next"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.config({
    extends: ["next/core-web-vitals"],
  }),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      // TypeScript rules - enabled with appropriate severity
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn", // Add this important rule

      // React rules
      "react/no-unescaped-entities": "off",

      // Additional helpful TypeScript rules (removed type-aware rules for now)
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
    },
  },
];
