// S3 영상 속 장소 찾기. 03 분석 중 → 02 되묻기 → Primary 탭 → 08 을 비트 5개로 본다(1배속 13.2초).
// ScenarioStage 에서는 폰 옆에 저장 파이프라인 4단계(Aside)가 비트 0~3 에 맞춰 하나씩 켜진다. 앱 03 스켈레톤은 움직이지 않아 비트 0~2 동안 폰은 정지다.
// 데모 장소: 지점명이 나오지 않는 지어낸 Shorts("대전 빵지순례 1순위") → 성심당 본점 · DCC점(실제 지점, 앱 Figma 02 목과 같음) 되묻기.
//   0 영상 읽기  0   ~ 2.4   03 · ① 켜짐(0.2 ~ 0.6)
//   1 후보 찾기  2.4 ~ 4.8   03 · ② 켜짐
//   2 확인       4.8 ~ 7.2   03 · ③ 켜짐
//   3 되묻기     7.2 ~ 9.8   7.4 02 로 크로스페이드(첫 행 선택, "성심당 본점으로 저장") · ④ 켜짐
//   4 저장       9.8 ~ 12.8  10.5 Primary 탭 → "저장하고 있어요" → 11.3 08(방금 · 원래 색) · 넷 다 켜진 채
//   12.8 ~ 13.2 처음으로 크로스페이드(엔진) · 옆 설명도 다시 흐리게
import { progress } from "../../kit/engine/clock";
import { defineScenario } from "../../kit/engine/types";
import { Aside, type AsideView } from "./Aside";
import { Screen, type View } from "./Screen";

const LIGHT_AT = [0.2, 2.6, 5.0, 7.4] as const;
const LIGHT_DURATION = 0.4;
const END = 12.8;
const SAVING_AT = 10.55;

const CAPTION = {
    waiting: "닫아도 뒤에서 계속 찾아요",
    ask: "어느 지점인지 모를 땐 물어봐요",
    saved: "고른 곳으로 바로 저장돼요",
} as const;

function asideAt(t: number): AsideView {
    const reset = progress(t, END, 0.4);
    return {
        lit: LIGHT_AT.map(
            (at) => progress(t, at, LIGHT_DURATION) * (1 - reset),
        ),
    };
}

export const S3 = defineScenario<View, AsideView>({
    id: "S3",
    title: "영상 속 장소 찾기",
    beats: [
        {
            id: "read",
            label: "영상 읽기",
            caption: CAPTION.waiting,
            start: 0,
            end: 2.4,
        },
        {
            id: "candidates",
            label: "후보 찾기",
            caption: CAPTION.waiting,
            start: 2.4,
            end: 4.8,
        },
        {
            id: "verify",
            label: "확인",
            caption: CAPTION.waiting,
            start: 4.8,
            end: 7.2,
        },
        {
            id: "ask",
            label: "되묻기",
            caption: CAPTION.ask,
            start: 7.2,
            end: 9.8,
        },
        {
            id: "save",
            label: "저장",
            caption: CAPTION.saved,
            start: 9.8,
            end: END,
        },
    ],
    duration: 13.2,
    segments: [
        { at: 0, xfade: 0, view: () => ({ kind: "analyzing" }) },
        {
            at: 7.4,
            xfade: 0.3,
            view: (t) => ({ kind: "confirm", saving: t >= SAVING_AT }),
        },
        { at: 11.3, xfade: 0.3, view: () => ({ kind: "detail" }) },
    ],
    Screen,
    motion: {
        taps: [{ target: "confirm-save", move: 10.0, at: 10.5 }],
        pointer: [[9.9, 10.8]],
    },
    aside: { view: asideAt, Component: Aside },
});
