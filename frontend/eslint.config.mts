import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist/**", "coverage/**", "public/**", ".vercel/**"]),

  { settings: { react: { version: "detect" } } },

  // Fichiers de configuration : exécutés par Node, pas par le navigateur.
  {
    files: ["*.config.{ts,mts,js}", "vitest.setup.ts"],
    languageOptions: { globals: globals.node },
  },

  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs.flat.recommended,

  // La fusion de déclaration (`declare module`) passe par une interface vide
  // qui étend le type réel : c'est le motif, pas un oubli.
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" },
      ],
    },
  },

  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-refresh": pluginReactRefresh },
    rules: {
      // Transformation JSX automatique (React 18) : plus d'import React requis.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // Un contexte et son hook d'accès partagent un objet privé au module : le
  // hook ne peut pas vivre ailleurs sans exporter le contexte lui-même. Le
  // rafraîchissement à chaud perd ces modules, c'est le prix assumé.
  {
    files: ["src/contexts/**/*.tsx", "src/i18n/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },

  // Les tests manipulent des doublures : `any` y est un outil, pas un oubli.
  {
    files: ["src/**/*.test.{ts,tsx}", "vitest.setup.ts"],
    languageOptions: { globals: globals.vitest },
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
]);
