// README.md 가 코드와 어긋나지 않았는지 검사한다. 걸리면 목록을 찍고 1 로 끝난다.
// 1) 사용 예: README 의 <!-- example: 이름 --> 바로 다음 ```tsx 블록이 src/app/examples/Slides.tsx 의
//    "// #region 이름" ~ "// #endregion" 구간과 글자 그대로 같은지("../../" → "./rmd/" 로 바꿔 비교). 예제 파일은 typecheck · lint 를 거친다.
//    예제 파일의 구간은 README 에서 모두 한 번 이상 써야 한다.
// 2) 시나리오 표: 등록부(SCENARIOS)의 id · 제목 · 비트 자막 · 한 바퀴 길이가 README 에 모두 있는지.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const readme = (await readFile(`${ROOT}README.md`, "utf8")).replaceAll(
    "\r\n",
    "\n",
);
const example = (
    await readFile(`${ROOT}src/app/examples/Slides.tsx`, "utf8")
).replaceAll("\r\n", "\n");

const problems = [];

const regions = new Map();
for (const match of example.matchAll(
    /\/\/ #region ([\w-]+)\n([\s\S]*?)\/\/ #endregion/g,
)) {
    regions.set(match[1], match[2].trimEnd().replaceAll('"../../', '"./rmd/'));
}

const used = new Set();
for (const match of readme.matchAll(
    /<!-- example: ([\w-]+) -->\s*```tsx\n([\s\S]*?)```/g,
)) {
    const [, name, code] = match;
    used.add(name);
    const expected = regions.get(name);
    if (expected == null) {
        problems.push(`README 예제 "${name}": 예제 파일에 이 구간이 없다`);
    } else if (code.trimEnd() !== expected) {
        problems.push(`README 예제 "${name}": 예제 파일 구간과 다르다`);
    }
}
for (const name of regions.keys()) {
    if (!used.has(name)) problems.push(`예제 구간 "${name}": README 에 없다`);
}

const server = await createServer({
    root: ROOT,
    logLevel: "error",
    server: { middlewareMode: true },
});
try {
    const { SCENARIOS } = await server.ssrLoadModule("/src/scenarios/index.ts");
    for (const scenario of SCENARIOS) {
        const must = [
            scenario.id,
            scenario.title,
            `${scenario.duration.toFixed(1)}초`,
            ...scenario.beats.map((beat) => beat.caption),
        ];
        for (const text of must) {
            if (!readme.includes(text)) {
                problems.push(`${scenario.id}: README 에 "${text}" 가 없다`);
            }
        }
    }
    console.log(`예제 ${used.size}개 · 시나리오 ${SCENARIOS.length}개 검사`);
} finally {
    await server.close();
}

if (problems.length > 0) {
    console.log(`문제 ${problems.length}개:`);
    for (const problem of problems) console.log(`  ${problem}`);
    process.exit(1);
}
console.log("문제 없음");
