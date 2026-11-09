// 사진 URL. landing scripts/fetch-photos.mjs 가 만든 webp 를 그대로 복사했다(출처 credits.json).
// lg 720×1280(Shorts 화면 · 배경 카드), sm 270×480(썸네일 · 셀 · 핀).
// 번들러에 매이지 않게 import.meta.glob 대신 정적 import 로 부른다(Vite · webpack 5 asset 모듈 모두 URL 문자열을 준다).
import p1015 from "./photos/1015.webp";
import p1015Sm from "./photos/1015-sm.webp";
import p1031 from "./photos/1031.webp";
import p1031Sm from "./photos/1031-sm.webp";
import p1036 from "./photos/1036.webp";
import p1036Sm from "./photos/1036-sm.webp";
import p1060 from "./photos/1060.webp";
import p1060Sm from "./photos/1060-sm.webp";
import p1080 from "./photos/1080.webp";
import p1080Sm from "./photos/1080-sm.webp";
import p225 from "./photos/225.webp";
import p225Sm from "./photos/225-sm.webp";
import p292 from "./photos/292.webp";
import p292Sm from "./photos/292-sm.webp";
import p312 from "./photos/312.webp";
import p312Sm from "./photos/312-sm.webp";
import p431 from "./photos/431.webp";
import p431Sm from "./photos/431-sm.webp";
import p488 from "./photos/488.webp";
import p488Sm from "./photos/488-sm.webp";
import p674 from "./photos/674.webp";
import p674Sm from "./photos/674-sm.webp";

const PHOTOS = {
    1080: { lg: p1080, sm: p1080Sm },
    488: { lg: p488, sm: p488Sm },
    1060: { lg: p1060, sm: p1060Sm },
    674: { lg: p674, sm: p674Sm },
    292: { lg: p292, sm: p292Sm },
    1031: { lg: p1031, sm: p1031Sm },
    1036: { lg: p1036, sm: p1036Sm },
    312: { lg: p312, sm: p312Sm },
    1015: { lg: p1015, sm: p1015Sm },
    431: { lg: p431, sm: p431Sm },
    225: { lg: p225, sm: p225Sm },
} as const satisfies Record<number, { lg: string; sm: string }>;

export type PhotoId = keyof typeof PHOTOS;

export function photo(id: PhotoId, size: "lg" | "sm" = "lg"): string {
    return PHOTOS[id][size];
}
