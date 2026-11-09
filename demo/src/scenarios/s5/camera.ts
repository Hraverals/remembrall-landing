// S5 카메라. landing demo/camera.ts 의 큐 두 번을 비트 안에 들어오게 줄였다. 시각에서 바로 계산하는 순수 함수다.
// 폰 몸체 전체만 살짝 움직인다(화면 안을 확대하지 않는다). 2D 만 쓴다(3D 기울기는 글자가 번진다).
//   ① 알림 도착 3.3: 확대 1.025 · 회전 -1.2° · 위로 4px(0.5초) → 4.2 에 0.6초 동안 원위치(4.8, 비트 끝 5.4)
//   ② 원래 색으로 풀림 9.7: 확대 1.025 · 회전 +1° · 위로 4px(0.5초) → 10.4 에 0.6초 동안 원위치(11.0, 비트 끝 11.6)
import { progress } from "../../kit/engine/clock";
import type { CameraPose } from "../../kit/engine/types";

// 들어가서 머물렀다 돌아오는 큐의 세기 0~1.
function cue(time: number, enter: number, leave: number): number {
    return progress(time, enter, 0.5) - progress(time, leave, 0.6);
}

const ZOOM = 0.025;
const LIFT = 4;

export const ARRIVE_AT = 3.3;
export const RESTORE_AT = 9.7;

export function cameraAt(time: number): CameraPose {
    const arrive = cue(time, ARRIVE_AT, 4.2);
    const restore = cue(time, RESTORE_AT, 10.4);
    const amount = arrive + restore;
    return {
        scale: 1 + ZOOM * amount,
        rotate: -1.2 * arrive + 1 * restore,
        y: -LIFT * amount,
    };
}
