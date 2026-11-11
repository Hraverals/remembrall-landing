// S6 추천에서 방문까지(BM 컨셉, concept: true). 앱에 없는 컨셉 화면 07e · 14 · 08d · 15 를 비트 4개로 본다(1배속 12.8초).
// 장소 · 채널 이름은 모두 지어낸 이름이고 15 숫자는 설명용 예시다. 무대 오른쪽 위 "컨셉" 배지는 엔진이 전 구간에 그린다.
// 무대 옆에는 퍼널 4단계(추천 → 저장 → 근처 도착 → 혜택 사용)가 비트에 맞춰 켜진다(숫자는 폰 안 15 에만 둔다).
//   0 발견    0   ~ 2.6   07e → 1.2 추천 진입 줄 탭 → 1.4 14 · ① 켜짐
//   1 저장    2.6 ~ 5.2   3.4 오후 네시(광고) 카드 저장 버튼 탭 → 저장된 상태 · ② 켜짐
//   2 도착    5.2 ~ 9.0   5.3 2주 뒤 지도 + 알림창 열린 채 · ③ 켜짐 → 6.8 알림 탭 → 7.0 08d · ④ 켜짐 → 7.5 썸네일 풀림(0.6초)
//   3 성과    9.0 ~ 12.4  9.2 15(머리말 "사장님 화면") → 9.6 부터 막대가 줄마다 0.15초씩 늦게 0.9초 동안 차오름
//   12.4 ~ 12.8 처음으로 크로스페이드(엔진) · 옆 설명도 처음으로
import { easeInOutQuad, progress } from "../../kit/engine/clock";
import { defineScenario } from "../../kit/engine/types";
import { FADE_VALUE } from "../../kit/ui/fade";
import { fadeFor } from "../screens/album";
import { DEMO_TWO_WEEKS_LATER, s6AdSave } from "../screens/data";
import { Aside, type AsideView } from "./Aside";
import { Screen, type View } from "./Screen";

const END = 12.4;
const SAVED_AT = 3.45;
const DETAIL_AT = 7.0;
const RESTORE_AT = 7.5;
// 앱 restoreDurationMs 600. 풀리기 전 바램: 오후 네시를 저장한 지 2주라 weeks(30%).
const RESTORE_DURATION = 0.6;
const RESTORE_FROM =
    FADE_VALUE[fadeFor(s6AdSave.savedAt, DEMO_TWO_WEEKS_LATER)];
// 15 막대: 9.6 부터 줄마다 0.15초씩 늦게, 0.9초 동안.
const FILL_AT = 9.6;
const FILL_STAGGER = 0.15;
const FILL_DURATION = 0.9;
const fillAt = (index: number) => FILL_AT + FILL_STAGGER * index;

// 옆 설명 ①~④ 가 켜지는 시각(0.4초).
const LIGHT_AT = [0.2, 2.8, 5.4, DETAIL_AT] as const;

function asideAt(t: number): AsideView {
    const reset = progress(t, END, 0.4);
    return {
        lit: LIGHT_AT.map((at) => progress(t, at, 0.4) * (1 - reset)),
        owner: progress(t, 9.2, 0.3) * (1 - reset),
    };
}

export const S6 = defineScenario<View, AsideView>({
    id: "S6",
    title: "추천에서 방문까지",
    concept: true,
    beats: [
        {
            id: "discover",
            label: "발견",
            caption: "저장한 곳 근처의 새 영상을 골라 줘요",
            start: 0,
            end: 2.6,
        },
        {
            id: "save",
            label: "저장",
            caption: "광고는 표시해 두고, 다른 영상처럼 저장해요",
            start: 2.6,
            end: 5.2,
        },
        {
            id: "arrive",
            label: "도착",
            caption: "2주 뒤 근처에서 열면 도착 혜택이 보여요",
            start: 5.2,
            end: 9.0,
        },
        {
            id: "report",
            label: "성과",
            caption: "사장님은 저장에서 방문까지를 숫자로 봐요",
            start: 9.0,
            end: END,
        },
    ],
    duration: 12.8,
    segments: [
        { at: 0, xfade: 0, view: () => ({ kind: "archive" }) },
        {
            at: 1.4,
            xfade: 0.3,
            view: (t) => ({ kind: "recommend", saved: t >= SAVED_AT }),
        },
        { at: 5.3, xfade: 0.3, view: () => ({ kind: "map" }) },
        {
            at: DETAIL_AT,
            xfade: 0.25,
            view: (t) => ({
                kind: "detail",
                restore:
                    RESTORE_FROM *
                    (1 -
                        progress(
                            t,
                            RESTORE_AT,
                            RESTORE_DURATION,
                            easeInOutQuad,
                        )),
            }),
        },
        {
            at: 9.2,
            xfade: 0.3,
            view: (t) => ({
                kind: "partner",
                fill: [0, 1, 2, 3].map((index) =>
                    progress(t, fillAt(index), FILL_DURATION),
                ),
            }),
        },
    ],
    Screen,
    motion: {
        taps: [
            { target: "recommend-entry", move: 0.5, at: 1.2 },
            { target: "ad-save", move: 2.8, at: 3.4 },
            { target: "notification", move: 6.3, at: 6.8 },
        ],
        pointer: [
            [0.3, 1.5],
            [2.7, 3.8],
            [6.1, 7.2],
        ],
    },
    aside: { view: asideAt, Component: Aside },
});
