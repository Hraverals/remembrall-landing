import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// 발표용 시나리오 데모. landing 과 따로 빌드한다(배포하지 않는다). 개발 서버는 landing(5173)과 겹치지 않게 5174.
export default defineConfig({
    plugins: [react()],
    server: { port: 5174 },
    build: {
        // 사진 · 아이콘 · 폰트는 인라인하지 않고 파일로 둔다.
        assetsInlineLimit: 0,
    },
});
