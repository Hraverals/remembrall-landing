// 카메라와 배경 카드. 시각에서 바로 계산하는 순수 함수라 되감기 · 반복에 상태가 남지 않는다.
// 카메라는 폰 몸체 전체만 살짝 움직인다(화면 안을 확대하지 않는다). 2D 만 쓴다(3D 기울기는 글자가 번진다).
//   ① 알림 도착 17.4: 확대 1.025 · 회전 -1.2° · 위로 4px, 들어갈 때 0.5초 → 20.0 에 0.6초 동안 원위치
//   ② 원래 색으로 풀림 20.9: 확대 1.025 · 회전 +1° · 위로 4px → 22.6 에 0.6초 동안 원위치
// 배경 카드(오른쪽 아래, 바램 30%)는 08 사진과 같은 시각에 0 으로 풀리고, 끝 크로스페이드 동안 다시 30% 로 돌아간다.
import { easeInOutCubic } from "./story";

function progress(time: number, start: number, duration: number): number {
    return easeInOutCubic(Math.max(0, Math.min(1, (time - start) / duration)));
}

// 들어가서 머물렀다 돌아오는 큐의 세기 0~1.
function cue(time: number, enter: number, leave: number): number {
    return progress(time, enter, 0.5) - progress(time, leave, 0.6);
}

const ZOOM = 0.025;
const LIFT = 4;

export function cameraAt(time: number): {
    scale: number;
    rotate: number;
    y: number;
} {
    const arrive = cue(time, 17.4, 20.0);
    const restore = cue(time, 20.9, 22.6);
    const amount = arrive + restore;
    return {
        scale: 1 + ZOOM * amount,
        rotate: -1.2 * arrive + 1 * restore,
        y: -LIFT * amount,
    };
}

// 배경 카드 위 bg/fade 불투명도(토큰 fade/weeks 0.3 과 같은 값에서 시작).
const MEMORY_FADE = 0.3;

export function memoryAt(time: number): number {
    return (
        MEMORY_FADE * (1 - progress(time, 20.9, 0.6)) +
        MEMORY_FADE * progress(time, 24.3, 0.4)
    );
}
