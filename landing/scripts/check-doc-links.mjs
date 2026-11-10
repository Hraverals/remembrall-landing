// 빌드된 페이지의 바깥 링크를 모두 열어 상태 코드를 보고한다. 사람이 돌리는 스크립트이고 CI · 빌드에는 넣지 않는다.
// 먼저 npm run build 로 dist 를 만든다. 다른 폴더를 보려면 경로를 준다: node scripts/check-doc-links.mjs <폴더>
// 대상: 폴더 안 *.html 의 href="http(s)://…" (중복 제거, #조각은 요청에서 빠진다).
// GET 으로 리다이렉트를 따라가고 본문은 읽지 않는다(APK 같은 큰 파일을 내려받지 않게). 실패하면 한 번 더 연다.
// 최종 2xx 면 정상, 리다이렉트를 거친 링크는 따로 알린다. 4xx · 5xx · 네트워크 오류가 하나라도 있으면 exit 1.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(
    process.argv[2] ?? fileURLToPath(new URL("../dist", import.meta.url)),
);
const CONCURRENCY = 6;
const TIMEOUT_MS = 15_000;
const HREF = /href="(https?:\/\/[^"]+)"/g;

let files;
try {
    files = (await readdir(dir)).filter((name) => name.endsWith(".html"));
} catch {
    console.error(`${dir} 가 없다. 먼저 npm run build 를 실행한다.`);
    process.exit(2);
}
if (files.length === 0) {
    console.error(`${dir} 에 html 이 없다. 먼저 npm run build 를 실행한다.`);
    process.exit(2);
}

// 링크 → 나온 파일들
const sources = new Map();
for (const file of files) {
    const html = await readFile(path.join(dir, file), "utf8");
    for (const [, raw] of html.matchAll(HREF)) {
        const url = raw.replaceAll("&amp;", "&");
        if (!sources.has(url)) sources.set(url, new Set());
        sources.get(url).add(file);
    }
}
const urls = [...sources.keys()].sort();

async function open(url) {
    const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "remembrall-link-check" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await response.body?.cancel();
    return {
        status: response.status,
        redirected: response.redirected,
        finalUrl: response.url,
    };
}

async function check(url) {
    let last;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            last = await open(url);
            if (last.status >= 200 && last.status < 300) return last;
        } catch (error) {
            last = { status: 0, error: error.cause?.code ?? error.name };
        }
    }
    return last;
}

const results = new Map();
let next = 0;
await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
        while (next < urls.length) {
            const url = urls[next++];
            results.set(url, await check(url));
        }
    }),
);

const counts = new Map();
const broken = [];
const redirected = [];
for (const url of urls) {
    const result = results.get(url);
    const label =
        result.status === 0 ? `오류(${result.error})` : String(result.status);
    counts.set(label, (counts.get(label) ?? 0) + 1);
    const ok = result.status >= 200 && result.status < 300;
    if (!ok) broken.push({ url, label });
    else if (result.redirected)
        redirected.push({ url, finalUrl: result.finalUrl });
}

console.log(
    `링크 ${urls.length}개 (${files.map((file) => path.join(path.basename(dir), file)).join(" · ")})`,
);
for (const [label, count] of [...counts].sort()) {
    console.log(`  ${label}: ${count}`);
}
if (redirected.length > 0) {
    console.log(`\n리다이렉트를 거쳐 열린 링크 ${redirected.length}개`);
    for (const { url, finalUrl } of redirected) {
        console.log(`  ${url}\n    → ${finalUrl}`);
    }
}
if (broken.length > 0) {
    console.log(`\n깨진 링크 ${broken.length}개`);
    for (const { url, label } of broken) {
        console.log(`  ${label} ${url} (${[...sources.get(url)].join(", ")})`);
    }
    process.exit(1);
}
console.log("\n깨진 링크 없음");
