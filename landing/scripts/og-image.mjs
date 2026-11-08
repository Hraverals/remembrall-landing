// OG · 트위터 카드 이미지를 만든다. vite dev 서버로 og.html(실제 컴포넌트 · 토큰 · 폰트)을 열고 1200×630 으로 찍어 public/og.png 에 둔다.
// 브라우저는 내려받지 않고 설치된 것을 쓴다(playwright-core). 기본 Edge, 다른 것은 OG_BROWSER_CHANNEL=chrome 처럼 준다.
// 빌드 때는 돌지 않는다. 문구 · 디자인이 바뀌면 npm run og 로 다시 만든다.
// page.evaluate · waitForFunction 안 코드는 브라우저에서 돈다.
/* global document, HTMLElement */
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { createServer } from "vite";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = fileURLToPath(new URL("../public/og.png", import.meta.url));
const CHANNEL = process.env.OG_BROWSER_CHANNEL ?? "msedge";

const server = await createServer({
    root: ROOT,
    logLevel: "error",
    server: { port: 0, strictPort: false },
});
await server.listen();
const base = server.resolvedUrls?.local[0];
if (base == null) throw new Error("dev 서버 주소를 알 수 없다");

const browser = await chromium.launch({ channel: CHANNEL });
try {
    const page = await browser.newPage({
        viewport: { width: 1200, height: 630 },
        deviceScaleFactor: 1,
    });
    await page.goto(new URL("og.html", base).href, {
        waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    // 폰 캔버스 배율이 정해지고(처음 0) 사진이 다 뜰 때까지 기다린다.
    await page.waitForFunction(() => {
        const canvas = document.querySelector("[data-demo-canvas]");
        const images = [...document.images];
        return (
            canvas instanceof HTMLElement &&
            !canvas.style.transform.includes("scale(0)") &&
            images.every((image) => image.complete && image.naturalWidth > 0)
        );
    });
    const shot = await page.locator("[data-og-card]").screenshot();
    await sharp(shot).png({ compressionLevel: 9 }).toFile(OUT);
    console.log(`public/og.png (${CHANNEL})`);
} finally {
    await browser.close();
    await server.close();
}
