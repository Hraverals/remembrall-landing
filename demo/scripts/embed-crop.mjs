// 임베드 플레이어가 잘라낼 영역을 잰다. 시나리오마다 한 바퀴 동안 무대 요소(폰 몸체 · 자막 · 옆 설명 · 컨셉 표시)가
// 차지하는 영역의 합집합을 1920×1080 무대 좌표로 구해 src/app/embedCrop.ts 에 쓴다. 임베드는 이 영역이 iframe 에 꽉 차게 확대한다.
// - 자막 · 옆 설명 · 컨셉 표시: 정지 화면(?s=ID&t=초&bg=transparent)을 0.5초 간격과 비트 끝마다 열어 잰다.
// - 폰 몸체: 카메라(motion.camera)가 움직이므로 연 화면 하나에서 0.02초 간격의 카메라 자세를 직접 넣어 잰다(transform 은 kit/engine/timeline.ts 와 같은 식).
// kit · scenarios 의 배치 · 자막 · 카메라를 고쳤으면 다시 돌리고(npm run embed:crop) 이어서 npm run embed 를 돌린다.
// 브라우저는 shots.mjs 와 같다(playwright-core, 기본 Edge, SHOTS_BROWSER_CHANNEL). page.evaluate 안 코드는 브라우저에서 돈다.
/* global document, getComputedStyle, requestAnimationFrame */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = `${ROOT}src/app/embedCrop.ts`;
const CHANNEL = process.env.SHOTS_BROWSER_CHANNEL ?? "msedge";
const STEP = 0.5;
const CAMERA_STEP = 0.02;
// 합집합 둘레에 두는 여유(무대 px). 잰 시각 사이의 움직임 · 글자 가장자리가 잘리지 않게.
const PAD = 6;

const server = await createServer({
    root: ROOT,
    logLevel: "error",
    server: { port: 0, strictPort: false },
});
await server.listen();
const base = server.resolvedUrls?.local[0];
if (base == null) throw new Error("dev 서버 주소를 알 수 없다");
const { SCENARIOS } = await server.ssrLoadModule("/src/scenarios/index.ts");

// 지금 화면에서 보이는 무대 요소의 상자들 [left, top, right, bottom].
function measure() {
    const boxes = [];
    const add = (rect) => {
        if (rect.width > 0 && rect.height > 0) {
            boxes.push([rect.left, rect.top, rect.right, rect.bottom]);
        }
    };
    const shown = (element, stop) => {
        for (let node = element; node != null; node = node.parentElement) {
            if (Number(getComputedStyle(node).opacity) < 0.02) return false;
            if (node === stop) break;
        }
        return true;
    };
    const stage = document.querySelector(".rmd-stage__canvas");
    const body = document.querySelector(".rmd-phone__body");
    if (stage == null || body == null) return null;
    add(body.getBoundingClientRect());
    for (const caption of stage.querySelectorAll(".rmd-stage__caption")) {
        if (!shown(caption, stage)) continue;
        const range = document.createRange();
        range.selectNodeContents(caption);
        add(range.getBoundingClientRect());
    }
    const aside = stage.querySelector(".rmd-stage__aside");
    for (const element of aside?.querySelectorAll("*") ?? []) {
        if (element.childElementCount > 0 || !shown(element, aside)) continue;
        add(element.getBoundingClientRect());
    }
    const concept = stage.querySelector(".rmd-stage__concept");
    if (concept != null) add(concept.getBoundingClientRect());
    return boxes;
}

const crops = {};
const browser = await chromium.launch({ channel: CHANNEL });
try {
    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
    });
    for (const scenario of SCENARIOS) {
        const times = new Set(scenario.beats.map((beat) => beat.end));
        for (let t = 0; t <= scenario.duration; t += STEP) times.add(t);
        const union = [Infinity, Infinity, -Infinity, -Infinity];
        const grow = (boxes) => {
            for (const [left, top, right, bottom] of boxes) {
                union[0] = Math.min(union[0], left);
                union[1] = Math.min(union[1], top);
                union[2] = Math.max(union[2], right);
                union[3] = Math.max(union[3], bottom);
            }
        };
        for (const t of [...times].sort((a, b) => a - b)) {
            await page.goto(`${base}?s=${scenario.id}&t=${t}&bg=transparent`, {
                waitUntil: "networkidle",
            });
            await page.waitForSelector("[data-rmd-ready]", {
                state: "attached",
            });
            await page.evaluate(() => document.fonts.ready);
            await page.waitForFunction(() => {
                const canvases = [
                    ...document.querySelectorAll("[data-rmd-canvas]"),
                ];
                return (
                    canvases.length > 0 &&
                    canvases.every(
                        (canvas) =>
                            !canvas.style.transform.includes("scale(0)"),
                    )
                );
            });
            // seek 는 준비된 뒤 setTimeout(0) 으로 온다. 두 프레임 기다린다.
            await page.evaluate(
                () =>
                    new Promise((resolve) =>
                        requestAnimationFrame(() =>
                            requestAnimationFrame(resolve),
                        ),
                    ),
            );
            const boxes = await page.evaluate(measure);
            if (boxes == null) throw new Error(`${scenario.id}: 무대가 없다`);
            grow(boxes);
        }
        // 카메라: 마지막으로 연 화면의 폰 몸체에 자세를 차례로 넣어 잰다.
        const poses = [];
        if (scenario.motion.camera != null) {
            for (let t = 0; t <= scenario.duration; t += CAMERA_STEP) {
                poses.push(scenario.motion.camera(t));
            }
        }
        grow(
            await page.evaluate((list) => {
                const body = document.querySelector("[data-rmd-camera]");
                return list.map((pose) => {
                    body.style.transform =
                        pose == null
                            ? ""
                            : `translateY(${pose.y}px) rotate(${pose.rotate}deg) scale(${pose.scale})`;
                    const rect = body.getBoundingClientRect();
                    return [rect.left, rect.top, rect.right, rect.bottom];
                });
            }, poses),
        );
        const x = Math.max(0, Math.floor(union[0] - PAD));
        const y = Math.max(0, Math.floor(union[1] - PAD));
        crops[scenario.id] = {
            x,
            y,
            width: Math.min(1920, Math.ceil(union[2] + PAD)) - x,
            height: Math.min(1080, Math.ceil(union[3] + PAD)) - y,
        };
        console.log(
            `${scenario.id}: 화면 ${times.size}곳 · 카메라 ${poses.length}곳에서 잼 → ${JSON.stringify(crops[scenario.id])}`,
        );
    }
} finally {
    await browser.close();
    await server.close();
}

const lines = Object.entries(crops).map(
    ([id, { x, y, width, height }]) =>
        `    ${id}: { x: ${x}, y: ${y}, width: ${width}, height: ${height} },`,
);
await writeFile(
    OUT,
    `// scripts/embed-crop.mjs 가 만든다(npm run embed:crop). 손으로 고치지 않는다.
// 시나리오마다 한 바퀴 동안 무대 요소(폰 몸체 · 자막 · 옆 설명 · 컨셉 표시)가 차지하는 영역의 합집합(1920×1080 무대 px, 둘레 여유 ${PAD}).
export type Crop = { x: number; y: number; width: number; height: number };

export const EMBED_CROP: Readonly<Record<string, Crop>> = {
${lines.join("\n")}
};
`,
);
console.log(`→ ${OUT}`);
