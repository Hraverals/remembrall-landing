// 검증용 스크린샷. vite dev 서버를 띄우고 설치된 브라우저(playwright-core, 기본 Edge)로 찍어 .shots/ 에 둔다(커밋하지 않는다).
// 1) 정지: ?s=ID&beat=n(비트 n 끝 상태) 을 1920×1080 으로 — beat-n.png, 폰만(&view=phone)도 — phone-n.png
// 2) step 재생: 갤러리에서 → 로 비트를 하나씩 재생하고 "비트 n 끝"이 뜨면 무대만 — step-n.png, ← 로 돌아간 끝 상태 — back-n.png
// 3) 맞춤: 갤러리 "좁고 낮게"(420×200) 상자에 무대 · 폰이 들어가는지 재고 찍는다 — fit-stage.png · fit-phone.png
// 4) 녹화: ?record=S5 를 1920×1080 으로 — record-S5.png · record-S5-transparent.png, 컨트롤 · 커서 · 2배속 자막 순서(반복)
// 다른 브라우저는 SHOTS_BROWSER_CHANNEL=chrome 처럼 준다. 시나리오를 고르려면 node scripts/shots.mjs S2.
// page.evaluate · waitForFunction 안 코드는 브라우저에서 돈다.
/* global document, HTMLElement, getComputedStyle */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = fileURLToPath(new URL("../.shots/", import.meta.url));
const CHANNEL = process.env.SHOTS_BROWSER_CHANNEL ?? "msedge";
const only = process.argv.slice(2);

const server = await createServer({
    root: ROOT,
    logLevel: "error",
    server: { port: 0, strictPort: false },
});
await server.listen();
const base = server.resolvedUrls?.local[0];
if (base == null) throw new Error("dev 서버 주소를 알 수 없다");

// 등록부를 dev 서버로 읽는다(시나리오 id · 비트 수).
const { SCENARIOS } = await server.ssrLoadModule("/src/scenarios/index.ts");
const targets = SCENARIOS.filter(
    (scenario) => only.length === 0 || only.includes(scenario.id),
);

// 사진 · 폰트가 다 뜨고 캔버스 배율이 정해질 때까지.
async function settle(page) {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => {
        const canvases = [...document.querySelectorAll("[data-rmd-canvas]")];
        return (
            canvases.length > 0 &&
            canvases.every(
                (canvas) =>
                    canvas instanceof HTMLElement &&
                    !canvas.style.transform.includes("scale(0)"),
            ) &&
            [...document.images].every((image) => image.complete)
        );
    });
}

const report = [];
const browser = await chromium.launch({ channel: CHANNEL });
try {
    await mkdir(OUT, { recursive: true });
    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
    });

    for (const scenario of targets) {
        const dir = `${OUT}${scenario.id}/`;
        await mkdir(dir, { recursive: true });

        // 1) 정지
        for (let index = 0; index < scenario.beats.length; index += 1) {
            await page.goto(`${base}?s=${scenario.id}&beat=${index}`, {
                waitUntil: "networkidle",
            });
            await page.waitForSelector("[data-rmd-ready]");
            await settle(page);
            await page.waitForTimeout(300);
            await page.screenshot({ path: `${dir}beat-${index}.png` });
        }
        for (let index = 0; index < scenario.beats.length; index += 1) {
            await page.goto(
                `${base}?s=${scenario.id}&beat=${index}&view=phone`,
                { waitUntil: "networkidle" },
            );
            await page.waitForSelector("[data-rmd-ready]");
            await settle(page);
            await page.waitForTimeout(300);
            await page
                .locator(".rmd-fit")
                .first()
                .screenshot({ path: `${dir}phone-${index}.png` });
        }
        report.push(
            `${scenario.id} 정지 무대 ${scenario.beats.length}장 + 폰만 ${scenario.beats.length}장`,
        );

        // 2) step 재생 · 뒤로
        await page.goto(`${base}?s=${scenario.id}`, {
            waitUntil: "networkidle",
        });
        await page.waitForSelector("[data-rmd-ready]");
        await settle(page);
        const stage = page.locator(".rmd-fit").first();
        const started = Date.now();
        const durations = [];
        for (let index = 0; index < scenario.beats.length; index += 1) {
            if (index > 0) await page.keyboard.press("ArrowRight");
            const from = Date.now();
            await page.waitForSelector(`[data-app-ended="${index}"]`, {
                timeout: 15000,
            });
            durations.push(((Date.now() - from) / 1000).toFixed(2));
            await page.waitForTimeout(150);
            await stage.screenshot({ path: `${dir}step-${index}.png` });
        }
        for (let index = scenario.beats.length - 2; index >= 0; index -= 1) {
            await page.keyboard.press("ArrowLeft");
            await page.waitForTimeout(250);
            await stage.screenshot({ path: `${dir}back-${index}.png` });
        }
        report.push(
            `${scenario.id} step 재생 비트별 ${durations.join(" · ")}초(합 ${((Date.now() - started) / 1000).toFixed(1)}초 중)`,
        );
    }

    // 3) 맞춤(첫 대상 시나리오)
    const first = targets[0];
    if (first != null) {
        await page.goto(`${base}?s=${first.id}`, { waitUntil: "networkidle" });
        await page.getByRole("button", { name: "좁고 낮게" }).click();
        for (const view of ["무대", "폰만"]) {
            await page
                .getByRole("group", { name: "보기" })
                .getByRole("button", { name: view })
                .click();
            await page.waitForSelector("[data-rmd-ready]");
            await settle(page);
            await page.waitForTimeout(300);
            const box = await page.locator(".app-box").boundingBox();
            const fit = await page.locator(".rmd-fit__box").boundingBox();
            const inside =
                box != null &&
                fit != null &&
                fit.x >= box.x - 0.5 &&
                fit.y >= box.y - 0.5 &&
                fit.x + fit.width <= box.x + box.width + 0.5 &&
                fit.y + fit.height <= box.y + box.height + 0.5;
            report.push(
                `맞춤 ${view}: 상자 ${box?.width}×${box?.height}, 그림 ${fit?.width.toFixed(1)}×${fit?.height.toFixed(1)} → ${inside ? "안에 들어감" : "넘침"}`,
            );
            await page.locator(".app-area").screenshot({
                path: `${OUT}fit-${view === "무대" ? "stage" : "phone"}.png`,
            });
        }
    }

    // 4) 녹화 모드(대상 중 S5, 없으면 첫 대상): 1920×1080 창에서 무대 크기 · 컨트롤 · 커서, 2배속 자막 순서(반복), 크로마키 바탕.
    const recordTarget =
        targets.find((scenario) => scenario.id === "S5") ?? targets[0];
    if (recordTarget != null) {
        const id = recordTarget.id;
        await page.goto(`${base}?record=${id}`, { waitUntil: "networkidle" });
        await page.waitForSelector("[data-rmd-ready]");
        await settle(page);
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${OUT}record-${id}.png` });
        const info = await page.evaluate(() => {
            const box = document
                .querySelector(".rmd-fit__box")
                ?.getBoundingClientRect();
            const record = document.querySelector("[data-app-record]");
            return {
                size: box == null ? "-" : `${box.width}×${box.height}`,
                buttons: document.querySelectorAll("button, input").length,
                cursor: record == null ? "-" : getComputedStyle(record).cursor,
            };
        });
        report.push(
            `녹화 ${id}: 무대 ${info.size}, 컨트롤 ${info.buttons}개, cursor ${info.cursor}`,
        );

        await page.goto(`${base}?record=${id}&speed=2`, {
            waitUntil: "networkidle",
        });
        await page.waitForSelector("[data-rmd-ready]");
        const seen = [];
        const until = Date.now() + (recordTarget.duration / 2) * 1000 * 1.6;
        while (Date.now() < until) {
            const caption = await page.evaluate(() => {
                const items = [
                    ...document.querySelectorAll(".rmd-stage__caption"),
                ];
                items.sort(
                    (a, b) =>
                        Number(getComputedStyle(b).opacity) -
                        Number(getComputedStyle(a).opacity),
                );
                return items[0]?.textContent ?? "";
            });
            if (caption !== "" && seen[seen.length - 1] !== caption) {
                seen.push(caption);
            }
            await page.waitForTimeout(100);
        }
        const index = (text) =>
            recordTarget.beats.findIndex((beat) => beat.caption === text);
        report.push(
            `녹화 ${id} 2배속 자막 순서(비트 번호): ${seen.map(index).join(" → ")}`,
        );

        await page.goto(`${base}?record=${id}&bg=transparent`, {
            waitUntil: "networkidle",
        });
        await page.waitForSelector("[data-rmd-ready]");
        await settle(page);
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${OUT}record-${id}-transparent.png` });
        report.push(`녹화 ${id} 크로마키 바탕 1장`);
    }
} finally {
    await browser.close();
    await server.close();
}
console.log(report.join("\n"));
console.log(`→ ${OUT}`);
