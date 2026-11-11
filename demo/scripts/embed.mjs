// 임베드 플레이어(embed.html)를 HTML 한 파일로 빌드해 ../presentation/rmd-player.html 에 쓴다. 발표 슬라이드가 iframe 으로 부른다.
// - JS · CSS · 사진 · 아이콘을 모두 HTML 안에 넣는다(file:// 로 열어도 돌게).
// - 폰트는 넣지 않는다. kit.css 의 fonts.css import 를 빼고 Google Fonts 링크를 넣은 뒤, kit 의 서체 토큰을 그 패밀리 이름으로 덮는다(kit 은 고치지 않는다).
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TMP = `${ROOT}node_modules/.tmp/embed/`;
const OUT = fileURLToPath(
    new URL("../../presentation/rmd-player.html", import.meta.url),
);
const FONTS_IMPORT = '@import "./fonts/fonts.css";';
const FONTS_HEAD = [
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Sans+KR:wght@400;500&display=swap" />',
    '<style>.rmd-root.rmd-root{--font-heading:"Gowun Dodum","Noto Sans KR",sans-serif;--font-body:"Noto Sans KR",system-ui,sans-serif}</style>',
].join("\n");

let fontsDropped = false;
await build({
    root: ROOT,
    configFile: false,
    logLevel: "warn",
    base: "./",
    plugins: [
        react(),
        {
            name: "rmd-embed-drop-fonts",
            enforce: "pre",
            transform(code, id) {
                if (!id.replaceAll("\\", "/").endsWith("/src/kit/kit.css")) {
                    return null;
                }
                if (!code.includes(FONTS_IMPORT)) {
                    throw new Error("kit.css 에 fonts.css import 가 없다");
                }
                fontsDropped = true;
                return code.replace(FONTS_IMPORT, "");
            },
        },
    ],
    build: {
        outDir: TMP,
        emptyOutDir: true,
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        cssCodeSplit: false,
        modulePreload: false,
        rollupOptions: {
            input: `${ROOT}embed.html`,
            output: { codeSplitting: false },
        },
    },
});
if (!fontsDropped) throw new Error("kit.css 를 거치지 않았다");

let html = await readFile(`${TMP}embed.html`, "utf8");
const assets = await readdir(`${TMP}assets`);
for (const name of assets) {
    const body = await readFile(`${TMP}assets/${name}`, "utf8");
    if (name.endsWith(".js")) {
        const tag = new RegExp(`<script[^>]*src="[^"]*${name}"[^>]*></script>`);
        if (!tag.test(html))
            throw new Error(`${name} 을 부르는 script 가 없다`);
        const inline = body.replaceAll("</script", "<\\/script");
        html = html.replace(
            tag,
            () => `<script type="module">${inline}</script>`,
        );
    } else if (name.endsWith(".css")) {
        const tag = new RegExp(`<link[^>]*href="[^"]*${name}"[^>]*>`);
        if (!tag.test(html)) throw new Error(`${name} 을 부르는 link 가 없다`);
        html = html.replace(tag, () => `<style>${body}</style>\n${FONTS_HEAD}`);
    } else {
        throw new Error(`인라인되지 않은 파일: ${name}`);
    }
}
if (/(src|href)="\.\/assets/.test(html) || html.includes("font/woff2")) {
    throw new Error("바깥 파일 참조나 인라인 폰트가 남았다");
}
if (!html.includes("fonts.googleapis.com")) {
    throw new Error("Google Fonts 링크가 들어가지 않았다");
}

await writeFile(OUT, html);
await rm(TMP, { recursive: true, force: true });
console.log(
    `→ ${OUT} (${(Buffer.byteLength(html) / 1048576).toFixed(2)}MB, 파일 ${assets.length}개 인라인)`,
);
