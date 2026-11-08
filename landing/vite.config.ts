import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

// 사이트 주소. VITE_SITE_URL(예: https://remembrall.pages.dev)이 있으면 og:url 을 넣고 og:image · twitter:image 를 절대 주소로 바꾼다.
// 없으면 index.html 그대로(og:url 없음, og:image 는 "/og.png"). Cloudflare Pages 환경 변수로 넣는다(process.env 가 .env 보다 우선).
function siteUrlMeta(siteUrl: string | undefined): Plugin {
    const site = siteUrl?.trim().replace(/\/+$/, "");
    return {
        name: "site-url-meta",
        transformIndexHtml(html) {
            if (!site) return html;
            return html
                .replaceAll('content="/og.png"', `content="${site}/og.png"`)
                .replace(
                    '<meta property="og:type" content="website" />',
                    `<meta property="og:type" content="website" />\n        <meta property="og:url" content="${site}/" />`,
                );
        },
    };
}

// 정적 사이트. Cloudflare Pages 는 루트 디렉터리 landing, 빌드 npm run build, 출력 dist 를 전제로 한다.
// 빌드 입력은 index.html 하나다(og.html 은 OG 이미지를 찍을 때 dev 서버에서만 연다).
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    return {
        plugins: [react(), siteUrlMeta(env.VITE_SITE_URL)],
        build: {
            // 사진 · 아이콘은 인라인하지 않고 해시 파일로 둔다(장기 캐시용).
            assetsInlineLimit: 0,
        },
    };
});
