// 빌드된 페이지의 바깥 링크를 모두 열어 상태 코드를 보고한다. 사람이 돌리는 스크립트이고 CI · 빌드에는 넣지 않는다.
// 먼저 npm run build 로 dist 를 만든다. 다른 폴더를 보려면 경로를 준다: node scripts/check-doc-links.mjs <폴더>
// 대상: 폴더 안 *.html 의 href="http(s)://…" (중복 제거, #조각은 요청에서 빠진다).
// GET 으로 리다이렉트를 따라가고 본문은 읽지 않는다(APK 같은 큰 파일을 내려받지 않게).
// 일시적인 실패(5xx · 429 · 네트워크 오류)는 쉬었다가 최대 3번 다시 연다(1 · 2 · 4초, 429 의 Retry-After 가 있으면 따름).
// GitHub 은 동시에 여러 개를 열면 504 를 돌려주기도 해서 동시에 3개만 연다. 4xx(429 제외)는 다시 열지 않는다.
// 최종 2xx 면 정상. 다시 시도해서 열린 링크와 리다이렉트를 거친 링크는 따로 알린다. 끝까지 실패한 링크가 있으면 exit 1.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const dir = path.resolve(
    process.argv[2] ?? fileURLToPath(new URL("../dist", import.meta.url)),
);
const CONCURRENCY = 3;
const TIMEOUT_MS = 15_000;
const BACKOFF_MS = [1_000, 2_000, 4_000]; // 다시 열기 전 쉬는 시간. 길이가 최대 재시도 횟수다.
const MAX_RETRY_AFTER_MS = 30_000;
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
        retryAfter: response.headers.get("retry-after"),
    };
}

const isOk = (result) => result.status >= 200 && result.status < 300;
const isTransient = (result) =>
    result.status === 0 || result.status === 429 || result.status >= 500;
const labelOf = (result) =>
    result.status === 0 ? `오류(${result.error})` : String(result.status);

// 429 의 Retry-After(초 또는 HTTP 날짜)를 따르고, 없으면 BACKOFF_MS 순서대로 쉰다.
function delayFor(result, retry) {
    if (result.status === 429 && result.retryAfter != null) {
        const seconds = Number(result.retryAfter);
        const ms = Number.isFinite(seconds)
            ? seconds * 1000
            : Date.parse(result.retryAfter) - Date.now();
        if (Number.isFinite(ms)) {
            return Math.min(Math.max(ms, 0), MAX_RETRY_AFTER_MS);
        }
    }
    return BACKOFF_MS[retry];
}

async function check(url) {
    let firstFailure;
    for (let retry = 0; ; retry++) {
        let result;
        try {
            result = await open(url);
        } catch (error) {
            result = { status: 0, error: error.cause?.code ?? error.name };
        }
        if (!isOk(result) && firstFailure == null)
            firstFailure = labelOf(result);
        if (!isTransient(result) || retry === BACKOFF_MS.length) {
            return { ...result, retries: retry, firstFailure };
        }
        await sleep(delayFor(result, retry));
    }
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
const recovered = [];
const redirected = [];
for (const url of urls) {
    const result = results.get(url);
    const label = labelOf(result);
    counts.set(label, (counts.get(label) ?? 0) + 1);
    if (!isOk(result)) {
        broken.push({ url, label, retries: result.retries });
        continue;
    }
    if (result.retries > 0) recovered.push({ url, ...result });
    if (result.redirected) redirected.push({ url, finalUrl: result.finalUrl });
}

console.log(
    `링크 ${urls.length}개 (${files.map((file) => path.join(path.basename(dir), file)).join(" · ")})`,
);
for (const [label, count] of [...counts].sort()) {
    console.log(`  ${label}: ${count}`);
}
console.log(`  다시 시도해서 열린 링크: ${recovered.length}`);
if (recovered.length > 0) {
    console.log(`
다시 시도해서 열린 링크 ${recovered.length}개`);
    for (const { url, firstFailure, retries } of recovered) {
        console.log(`  ${url} (처음 ${firstFailure}, ${retries}번 다시 시도)`);
    }
}
if (redirected.length > 0) {
    console.log(`\n리다이렉트를 거쳐 열린 링크 ${redirected.length}개`);
    for (const { url, finalUrl } of redirected) {
        console.log(`  ${url}\n    → ${finalUrl}`);
    }
}
if (broken.length > 0) {
    console.log(`\n깨진 링크 ${broken.length}개`);
    for (const { url, label, retries } of broken) {
        const tried = retries > 0 ? `, ${retries}번 다시 시도` : "";
        console.log(
            `  ${label} ${url} (${[...sources.get(url)].join(", ")}${tried})`,
        );
    }
    process.exit(1);
}
console.log("\n깨진 링크 없음");
