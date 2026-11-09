// S4 바랜 기억. landing 기억 탭 장면을 방금 → 3주 뒤 → 5개월 뒤 비트 3개로 본다(1배속 8.4초, 손가락 없음).
// 섹션 · 이름 · 캡션은 시점마다 앱 규칙(toAlbumSections)으로 다시 계산한다. 바램은 비트가 바뀐 직후 1.2초 동안만 이어 바뀐다.
//   0 방금      0   ~ 2.0  정지(성심당 · 소제동 원래 색, "이번 주")
//   1 3주 뒤    2.0 ~ 5.0  2.3 ~ 3.5 바램 방금 → 3주 뒤 값 · 3.6 3주 뒤 섹션 배치로 크로스페이드(0.3초)
//   2 5개월 뒤  5.0 ~ 8.0  5.3 ~ 6.5 바램 3주 뒤 → 5개월 뒤 값 · 6.6 5개월 뒤 섹션 배치("지난해 가을 · 여름")로 크로스페이드
//   8.0 ~ 8.4 처음(방금)으로 크로스페이드(엔진)
import { progress } from "../../kit/engine/clock";
import { defineScenario } from "../../kit/engine/types";
import { Screen, type Stage, type View } from "./Screen";

const age = (t: number) => progress(t, 2.3, 1.2) + progress(t, 5.3, 1.2);
const archive = (layout: Stage) => (t: number) =>
    ({ kind: "archive", layout, age: age(t) }) satisfies View;

export const S4 = defineScenario<View>({
    id: "S4",
    title: "바랜 기억",
    beats: [
        {
            id: "now",
            label: "방금",
            caption: "방금 저장한 곳은 선명해요",
            start: 0,
            end: 2.0,
        },
        {
            id: "weeks",
            label: "3주 뒤",
            caption: "3주 뒤, 사진이 조금 바래요",
            start: 2.0,
            end: 5.0,
        },
        {
            id: "months",
            label: "5개월 뒤",
            caption: "5개월 뒤, 더 바래고 계절로 묶여요",
            start: 5.0,
            end: 8.0,
        },
    ],
    duration: 8.4,
    segments: [
        { at: 0, xfade: 0, view: archive(0) },
        { at: 3.6, xfade: 0.3, view: archive(1) },
        { at: 6.6, xfade: 0.3, view: archive(2) },
    ],
    Screen,
    motion: { taps: [], pointer: [] },
});
