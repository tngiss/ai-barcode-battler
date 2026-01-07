import eslintPluginTs from "@typescript-eslint/eslint-plugin";
import parserTs from "@typescript-eslint/parser";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import { readFileSync } from "fs";

const prettierConfig = JSON.parse(
  readFileSync(new URL("./.prettierrc", import.meta.url), "utf8")
);

export default [
  {
    ignores: ["node_modules", "dist", "build"],
  },
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: eslintPluginReact,
      prettier: eslintPluginPrettier,
      "simple-import-sort": eslintPluginSimpleImportSort,
      "@typescript-eslint": eslintPluginTs,
    },
    rules: {
      "prettier/prettier": ["error", prettierConfig],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/order": "off",

      "react/react-in-jsx-scope": "off",
      "comma-dangle": "off",
      // '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // 'no-console': 'warn',
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
