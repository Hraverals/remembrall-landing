// scripts/embed-crop.mjs 가 만든다(npm run embed:crop). 손으로 고치지 않는다.
// 시나리오마다 한 바퀴 동안 무대 요소(폰 몸체 · 자막 · 옆 설명 · 컨셉 표시)가 차지하는 영역의 합집합(1920×1080 무대 px, 둘레 여유 6).
export type Crop = { x: number; y: number; width: number; height: number };

export const EMBED_CROP: Readonly<Record<string, Crop>> = {
    S1: { x: 730, y: 64, width: 460, height: 952 },
    S2: { x: 702, y: 64, width: 516, height: 952 },
    S3: { x: 413, y: 64, width: 1179, height: 952 },
    S4: { x: 741, y: 64, width: 438, height: 952 },
    S5: { x: 680, y: 45, width: 560, height: 971 },
    S6: { x: 340, y: 42, width: 1522, height: 974 },
};
