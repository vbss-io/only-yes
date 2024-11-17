module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "no-relative-import-paths"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "no-relative-import-paths/no-relative-import-paths": [
      "warn",
      {
        allowSameFolder: true,
        rootDir: "src",
        prefix: "@",
      },
    ],
    "react-hooks/exhaustive-deps": ["off"],
  },
};
