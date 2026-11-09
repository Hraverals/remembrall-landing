// S2 공유 한 번으로 저장. landing 장면 1~3(Shorts → 공유 시트 → 받음 시트 → 기억 탭 분석 중 → 성심당 본점 확정)을 비트 4개로 나눈 것이다.
// landing 보다 빠르다(1배속 9.8초). 비트마다 끝나기 0.5초 넘게 전에 동작을 마치고 손가락을 숨겨, step 에서 멈춘 화면이 정돈돼 있다.
//   0 공유      0   ~ 2.4  1.0 공유 탭 → 1.15 공유 시트(0.35초)
//   1 저장      2.4 ~ 5.0  2.9 Remembrall 탭 → 3.1 받음 시트 "저장하고 있어요" → 4.1 "저장했어요"
//   2 분석 중   5.0 ~ 7.2  5.5 "기억 탭 보기" 탭 → 5.7 기억 탭(맨 앞 셀 분석 중)
//   3 장소 확정 7.2 ~ 9.4  7.6 성심당 본점으로 바뀜
//   9.4 ~ 9.8 처음(Shorts)으로 크로스페이드(엔진)
import { progress } from "../../kit/engine/clock";
import { defineScenario } from "../../kit/engine/types";
import { Screen, type View } from "./Screen";

const SAVED_AT = 4.1;
const RESOLVED_AT = 7.6;

export const S2 = defineScenario<View>({
    id: "S2",
    title: "공유 한 번으로 저장",
    beats: [
        {
            id: "share",
            label: "공유",
            caption: "Shorts에서 마음에 든 곳을 공유해요",
            start: 0,
            end: 2.4,
        },
        {
            id: "saved",
            label: "저장",
            caption: "공유 한 번이면 저장돼요",
            start: 2.4,
            end: 5.0,
        },
        {
            id: "analyzing",
            label: "분석 중",
            caption: "영상 속 장소를 찾고 있어요",
            start: 5.0,
            end: 7.2,
        },
        {
            id: "resolved",
            label: "장소 확정",
            caption: "어디인지 찾으면 장소 이름으로 바뀌어요",
            start: 7.2,
            end: 9.4,
        },
    ],
    duration: 9.8,
    segments: [
        {
            at: 0,
            xfade: 0,
            view: (t) => ({ kind: "shorts", sheet: progress(t, 1.15, 0.35) }),
        },
        {
            at: 3.1,
            xfade: 0.2,
            view: (t) => ({
                kind: "received",
                status: t < SAVED_AT ? "saving" : "saved",
                enter: progress(t, 3.1, 0.35),
                text: progress(t, SAVED_AT, 0.2),
            }),
        },
        {
            at: 5.7,
            xfade: 0.25,
            view: (t) => ({ kind: "archive", analyzing: t < RESOLVED_AT }),
        },
    ],
    Screen,
    motion: {
        taps: [
            { target: "share", move: 0.4, at: 1.0 },
            { target: "share-app", move: 2.5, at: 2.9 },
            { target: "open-archive", move: 5.1, at: 5.5 },
        ],
        pointer: [
            [0.3, 1.35],
            [2.45, 3.2],
            [5.05, 5.8],
        ],
    },
});
