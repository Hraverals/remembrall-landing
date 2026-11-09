// 바램 단계와 사진 위 bg/fade 불투명도. kit ui(Thumb · MapMarkers)와 시나리오 장면이 같이 쓴다. landing demo/album.ts 의 앞부분이다.
// 바램: 7일 미만 recent, 30일 미만 weeks, 그 이상 months(단계 계산은 scenarios/screens/album.ts 의 fadeFor).
export type Fade = "recent" | "weeks" | "months";

// 사진 위 bg/fade 의 불투명도(토큰 fade/*).
export const FADE_OPACITY: Readonly<Record<Fade, string>> = {
    recent: "var(--fade-recent)",
    weeks: "var(--fade-weeks)",
    months: "var(--fade-months)",
};

// 같은 값의 숫자(바램을 이어서 바꿀 때 쓴다). 토큰 fade/* 와 같아야 한다.
export const FADE_VALUE: Readonly<Record<Fade, number>> = {
    recent: 0,
    weeks: 0.3,
    months: 0.5,
};

// 바램 단계 또는 불투명도 숫자 → CSS opacity 값.
export function fadeOpacity(fade: Fade | number): string {
    return typeof fade === "number" ? String(fade) : FADE_OPACITY[fade];
}
