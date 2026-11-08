// 사진 URL. scripts/fetch-photos.mjs 가 만든 webp 를 Vite 가 해시 파일명으로 내보낸다.
// lg 720×1280(Shorts 화면 · 배경 카드), sm 270×480(썸네일 · 셀 · 핀).
export type PhotoId =
    1080 | 488 | 1060 | 674 | 292 | 1031 | 1036 | 312 | 1015 | 431 | 225;

const urls = import.meta.glob<string>("./photos/*.webp", {
    eager: true,
    query: "?url",
    import: "default",
});

export function photo(id: PhotoId, size: "lg" | "sm" = "lg"): string {
    const url = urls[`./photos/${id}${size === "sm" ? "-sm" : ""}.webp`];
    if (url == null) throw new Error(`사진 ${id} (${size}) 이 없다`);
    return url;
}
