// S5 근처에서 다시. landing 장면 5~7(지도 걷기 → 상태 표시줄 알림 → 알림창 끌어내리기 → 알림 탭 → 08)을 비트 4개로 나눈 것이다(1배속 12.0초).
// 알림은 헤드업 없이 상태 표시줄 아이콘 · 알림창에만 온다(앱 nearby 채널 중요도 DEFAULT). 알림창 카드 문구는 앱 규칙(nearbyBody)이다.
// 08 은 앱 savedPlaceSheet 과 같게 핀은 처음부터 원래 색, 썸네일만 저장 시각대로의 바램(3주 → 30%)에서 600ms(inOut quad) 동안 풀린다.
//   0 걷는 중      0   ~ 3.0   0.3 ~ 2.5 성심당 쪽으로 걷기
//   1 알림 도착    3.0 ~ 5.4   3.3 상태 표시줄 알림 아이콘 · 카메라 큐 ①(4.8 원위치)
//   2 끌어내림     5.4 ~ 8.4   5.5 손가락이 아이콘에 → 6.0 ~ 6.7 끌어내림 · 알림창(같은 easing) → 7.0 손가락 숨김
//   3 원래 색      8.4 ~ 11.6  9.0 알림 탭 → 9.2 08 → 9.7 썸네일 풀림(0.6초) · 카메라 큐 ②(11.0 원위치)
//   11.6 ~ 12.0 처음(지도 출발)으로 크로스페이드(엔진)
import { easeInOutQuad, progress } from "../../kit/engine/clock";
import { defineScenario } from "../../kit/engine/types";
import { FADE_VALUE } from "../../kit/ui/fade";
import { fadeFor } from "../screens/album";
import { DEMO_LATER, saves } from "../screens/data";
import { ARRIVE_AT, cameraAt, RESTORE_AT } from "./camera";
import { Screen, type View } from "./Screen";

const DRAG = {
    from: "notification-icon",
    to: { x: 180, y: 300 },
    at: 6.0,
    duration: 0.7,
} as const;

// 앱 restoreDurationMs 600.
const RESTORE_DURATION = 0.6;
// 썸네일이 풀리기 전 바램: 성심당을 저장한 지 3주라 weeks(30%).
const RESTORE_FROM =
    saves[0] == null ? 0 : FADE_VALUE[fadeFor(saves[0].savedAt, DEMO_LATER)];

export const S5 = defineScenario<View>({
    id: "S5",
    title: "근처에서 다시",
    beats: [
        {
            id: "walk",
            label: "걷는 중",
            caption: "저장한 곳 근처를 지나가요",
            start: 0,
            end: 3.0,
        },
        {
            id: "arrive",
            label: "알림 도착",
            caption: "근처에 오면 화면을 가리지 않고 알림이 와요",
            start: 3.0,
            end: 5.4,
        },
        {
            id: "pull",
            label: "알림창",
            caption: "몇 주 전에 저장한 곳인지 알려 줘요",
            start: 5.4,
            end: 8.4,
        },
        {
            id: "open",
            label: "원래 색",
            caption: "누르면 원래 색으로 돌아와요",
            start: 8.4,
            end: 11.6,
        },
    ],
    duration: 12.0,
    segments: [
        {
            at: 0,
            xfade: 0,
            view: (t) => ({
                kind: "map",
                walk: progress(t, 0.3, 2.2),
                notified: t >= ARRIVE_AT,
                pull: progress(t, DRAG.at, DRAG.duration),
            }),
        },
        {
            at: 9.2,
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
    ],
    Screen,
    motion: {
        taps: [{ target: "notification", move: 8.55, at: 9.0 }],
        drags: [DRAG],
        pointer: [
            [5.5, 7.0],
            [8.5, 9.3],
        ],
        camera: cameraAt,
    },
});
