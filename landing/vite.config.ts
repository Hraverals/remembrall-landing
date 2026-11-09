import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

import { docPages, type DocPage } from "./plugins/doc-pages.ts";

// 문서 페이지. name 마다 <name>.html(껍데기) · content/<name>.md(본문)가 있고 /<name> 으로 열린다.
const DOC_PAGES: readonly DocPage[] = [{ name: "tech-spec" }];

// 문서 본문의 "repo:경로" 링크가 가리키는 곳(팀 레포 develop).
const REPO_BASE =
    "https://github.com/kakaotechcampus-4/ktc4-chungnam-3/blob/develop/";

// 사이트 주소. VITE_SITE_URL(예: https://remembrall.pages.dev)이 있으면 og:url 을 넣고 og:image · twitter:image 를 절대 주소로 바꾼다.
// og:url 은 페이지마다 다르다(index.html → /, tech-spec.html → /tech-spec).
// 없으면 html 그대로(og:url 없음, og:image 는 "/og.png"). Cloudflare Pages 환경 변수로 넣는다(process.env 가 .env 보다 우선).
function siteUrlMeta(siteUrl: string | undefined): Plugin {
    const site = siteUrl?.trim().replace(/\/+$/, "");
    return {
        name: "site-url-meta",
        transformIndexHtml(html, ctx) {
            if (!site) return html;
            const pagePath =
                ctx.path === "/index.html"
                    ? "/"
                    : ctx.path.replace(/\.html$/, "");
            return html
                .replaceAll('content="/og.png"', `content="${site}/og.png"`)
                .replace(
                    '<meta property="og:type" content="website" />',
                    `<meta property="og:type" content="website" />\n        <meta property="og:url" content="${site}${pagePath}" />`,
                );
        },
    };
}

// 정적 사이트. Cloudflare Pages 는 루트 디렉터리 landing, 빌드 npm run build, 출력 dist 를 전제로 한다.
// 빌드 입력은 index.html 과 문서 페이지들이다(og.html 은 OG 이미지를 찍을 때 dev 서버에서만 연다).
// 문서 페이지는 dist/<name>.html 로 평평하게 둔다. Cloudflare Pages · vite preview 모두 /<name> 을 리다이렉트 없이 이 파일로 연다.
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    return {
        plugins: [
            react(),
            docPages(DOC_PAGES, REPO_BASE),
            siteUrlMeta(env.VITE_SITE_URL),
        ],
        build: {
            // 사진 · 아이콘은 인라인하지 않고 해시 파일로 둔다(장기 캐시용).
            assetsInlineLimit: 0,
            rolldownOptions: {
                input: {
                    index: path.resolve(import.meta.dirname, "index.html"),
                    ...Object.fromEntries(
                        DOC_PAGES.map((page) => [
                            page.name,
                            path.resolve(
                                import.meta.dirname,
                                `${page.name}.html`,
                            ),
                        ]),
                    ),
                },
            },
        },
    };
});
