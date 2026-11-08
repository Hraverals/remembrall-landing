import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// 정적 사이트. Cloudflare Pages 는 루트 디렉터리 landing, 빌드 npm run build, 출력 dist 를 전제로 한다.
export default defineConfig({
    plugins: [react()],
    build: {
        // 사진 · 아이콘은 인라인하지 않고 해시 파일로 둔다(장기 캐시용).
        assetsInlineLimit: 0,
    },
});
