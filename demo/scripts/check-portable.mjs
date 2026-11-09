// kit · scenarios 를 폴더째 옮겨도 도는지, 가져다 쓰는 쪽 스타일과 부딪히지 않는지 검사한다. 걸리면 목록을 찍고 1 로 끝난다.
// 1) import: react · react-dom · gsap(하위 경로 포함)과 상대 경로만. 정적 · 동적 · 부수효과 import 모두 본다.
// 2) CSS: 규칙의 선택자마다 맨 앞 복합 선택자가 .rmd- 클래스여야 한다(@font-face · @media 안 규칙도 본다). 전역(html · body · * · :root)은 안 된다.
// 3) TSX className: 문자열 클래스가 모두 rmd- 로 시작해야 한다.
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIRS = ["src/kit", "src/scenarios"];
const ALLOWED = /^(react|react-dom|gsap)(\/|$)|^\.{1,2}\//;

async function files(dir) {
    const entries = await readdir(`${ROOT}${dir}`, {
        withFileTypes: true,
        recursive: true,
    });
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) =>
            `${entry.parentPath}/${entry.name}`.replaceAll("\\", "/"),
        );
}

// 선택자 목록을 괄호 밖 쉼표로만 나눈다(:where(a, b) 는 하나).
function splitTopLevel(list) {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const char of list) {
        if (char === "(") depth += 1;
        if (char === ")") depth -= 1;
        if (char === "," && depth === 0) {
            parts.push(current);
            current = "";
        } else current += char;
    }
    parts.push(current);
    return parts;
}

const problems = [];
const imports = new Map();
let cssRules = 0;
let classNames = 0;

for (const dir of DIRS) {
    for (const file of await files(dir)) {
        const relative = file.slice(ROOT.replaceAll("\\", "/").length);
        if (/\.(ts|tsx)$/.test(file)) {
            const source = await readFile(file, "utf8");
            const specifiers = [
                ...source.matchAll(/\bfrom\s+"([^"]+)"/g),
                ...source.matchAll(/\bimport\s+"([^"]+)"/g),
                ...source.matchAll(/\bimport\(\s*"([^"]+)"\s*\)/g),
            ].map((match) => match[1]);
            for (const specifier of specifiers) {
                const bare =
                    ALLOWED.test(specifier) && !specifier.startsWith(".");
                if (bare)
                    imports.set(specifier, (imports.get(specifier) ?? 0) + 1);
                if (!ALLOWED.test(specifier)) {
                    problems.push(`${relative}: import "${specifier}"`);
                }
            }
            for (const match of source.matchAll(/className="([^"]*)"/g)) {
                for (const name of match[1].split(/\s+/).filter(Boolean)) {
                    classNames += 1;
                    if (!name.startsWith("rmd-")) {
                        problems.push(`${relative}: className "${name}"`);
                    }
                }
            }
            for (const match of source.matchAll(
                /"(rmd-[^"]*|[a-z-]+--[a-z-]+)"/g,
            )) {
                if (!match[1].startsWith("rmd-")) {
                    problems.push(`${relative}: 클래스 문자열 "${match[1]}"`);
                }
            }
        }
        if (file.endsWith(".css")) {
            const css = (await readFile(file, "utf8")).replace(
                /\/\*[\s\S]*?\*\//g,
                "",
            );
            // 블록을 펼쳐 선택자 머리만 모은다(@media 는 안쪽 규칙을 본다, @font-face · @import 는 선택자가 없다).
            for (const match of css.matchAll(/([^{}]+)\{/g)) {
                const head = match[1].trim();
                if (head.startsWith("@")) continue;
                for (const selector of splitTopLevel(head)) {
                    cssRules += 1;
                    const first = selector.trim().split(/\s+/)[0] ?? "";
                    if (!/^\.rmd-[\w-]+/.test(first)) {
                        problems.push(
                            `${relative}: 선택자 "${selector.trim()}"`,
                        );
                    }
                }
            }
        }
    }
}

console.log(
    `패키지 import: ${[...imports].map(([name, count]) => `${name}(${count})`).join(", ") || "없음"}`,
);
console.log(`CSS 선택자 ${cssRules}개 · className ${classNames}개 검사`);
if (problems.length > 0) {
    console.log(`문제 ${problems.length}개:`);
    for (const problem of problems) console.log(`  ${problem}`);
    process.exit(1);
}
console.log("문제 없음");
