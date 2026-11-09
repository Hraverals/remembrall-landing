import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist", ".shots"] },
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.strict,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
        },
    },
    // kit · scenarios 는 폴더째 발표 자료로 옮긴다. react · react-dom · gsap 과 상대 경로만 import 한다.
    {
        files: ["src/kit/**/*.{ts,tsx}", "src/scenarios/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^(?!(react|react-dom|gsap)(/|$)|[.]{1,2}/)",
                            message:
                                "kit · scenarios 는 react · react-dom · gsap 과 상대 경로만 import 한다.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["scripts/**/*.mjs", "*.config.{js,ts}"],
        extends: [js.configs.recommended],
        languageOptions: {
            globals: globals.node,
        },
    },
);
