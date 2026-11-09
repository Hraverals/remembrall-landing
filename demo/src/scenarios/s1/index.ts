// S1 잊힌 저장(문제). Remembrall 이 없을 때를 비트 2개로 본다(1배속 8.0초, 손가락 없음). Remembrall 화면 · YouTube 로고 · 고유 UI 는 없다.
//   0 쌓임  0   ~ 3.6  일반 '저장한 영상' 목록. 맨 앞 성심당 Shorts 앞에 0.4초부터 새 영상 6개가 0.45초 간격으로 끼며 밀어낸다(3.1 에 끝)
//   1 지나침 3.6 ~ 7.6  3.8 일반 지도 → 4.2 ~ 6.9 사람 점이 성심당 바로 앞을 지나쳐 계속 간다. 알림 · 화면 변화 없음
//                       저장했던 곳은 흐린 점선 원이 4.8 ~ 6.4 동안만 옅게 보인다(보는 사람에게만)
//   7.6 ~ 8.0 처음으로 크로스페이드(엔진)
import { progress } from "../../kit/engine/clock";
import { defineScenario } from "../../kit/engine/types";
import { s1Arrivals } from "../screens/data";
import { Screen, type View } from "./Screen";

const ARRIVE_AT = 0.4;
const ARRIVE_GAP = 0.45;
const ARRIVE_DURATION = 0.35;
const MARK_OPACITY = 0.9;

const added = (t: number) =>
    s1Arrivals.reduce(
        (sum, _photo, index) =>
            sum + progress(t, ARRIVE_AT + ARRIVE_GAP * index, ARRIVE_DURATION),
        0,
    );

export const S1 = defineScenario<View>({
    id: "S1",
    title: "잊힌 저장",
    beats: [
        {
            id: "pile",
            label: "쌓임",
            caption: "가 보고 싶어서 저장했는데",
            start: 0,
            end: 3.6,
        },
        {
            id: "pass",
            label: "지나침",
            caption: "바로 앞을 지나가도 기억나지 않아요",
            start: 3.6,
            end: 7.6,
        },
    ],
    duration: 8.0,
    segments: [
        { at: 0, xfade: 0, view: (t) => ({ kind: "pile", added: added(t) }) },
        {
            at: 3.8,
            xfade: 0.3,
            view: (t) => ({
                kind: "pass",
                walk: progress(t, 4.2, 2.7),
                mark:
                    MARK_OPACITY *
                    (progress(t, 4.8, 0.5) - progress(t, 6.4, 0.5)),
            }),
        },
    ],
    Screen,
    motion: { taps: [], pointer: [] },
});
