// 시나리오 정의 타입. 시나리오는 비트(짧은 단계)로 나뉘고, 장면 구간(segments)이 시각마다 화면 상태(view)를 정한다.
// 엔진은 view 의 모양을 모른다. 같은 시나리오의 segments 가 만든 view 를 같은 시나리오의 Screen 에만 넘긴다.
import type { ComponentType } from "react";

// 비트 하나. start ~ end(초, 1배속). 자막은 비트 시작에 바뀐다. end 의 화면은 멈춰 둘 수 있는 정돈된 상태여야 한다.
export type Beat = {
    id: string;
    label: string;
    caption: string;
    start: number;
    end: number;
};

// 장면 구간. at 부터 다음 구간 전까지 view(t) 를 그린다. 앞 구간과 xfade 초 동안 크로스페이드한다.
export type Segment<V> = {
    at: number;
    xfade: number;
    view: (time: number) => V;
};

// 탭: move 에 대상으로 움직이기 시작해 at 에 누른다. 대상은 장면 안 data-rmd-target 이다.
export type Tap = { target: string; move: number; at: number };

// 끌기: from 대상에서 to(360×800 논리 px)까지 at 부터 duration 동안.
export type Drag = {
    from: string;
    to: { x: number; y: number };
    at: number;
    duration: number;
};

export type CameraPose = { scale: number; rotate: number; y: number };

export type Motion = {
    taps: readonly Tap[];
    drags?: readonly Drag[];
    // 손가락이 보이는 구간 [나타남, 사라짐].
    pointer: readonly (readonly [number, number])[];
    // 폰 몸체 전체를 살짝 움직인다(화면 안은 확대하지 않는다).
    camera?: (time: number) => CameraPose;
};

export type AsideProps = { beat: number; time: number };

export type Scenario<V = unknown> = {
    id: string;
    title: string;
    concept?: boolean;
    beats: readonly Beat[];
    // loop 한 바퀴. 마지막 비트 끝보다 길면 남는 시간 동안 처음 화면으로 크로스페이드한다(엔진이 만든다).
    duration: number;
    // 마지막 비트 끝까지의 장면 구간. 첫 구간의 at 은 0 이다.
    segments: readonly Segment<V>[];
    Screen: ComponentType<{ view: V }>;
    motion: Motion;
    // ScenarioStage 의 폰 옆 설명 층. beat 는 지금 비트(-1 은 없음), time 은 화면이 다시 그려질 때의 시각이다(프레임마다 오지 않는다).
    Aside?: ComponentType<AsideProps>;
};

// 시나리오 안에서는 V 로 타입을 검사하고, 등록부 · 컴포넌트에는 V 를 지운 Scenario 로 넘긴다.
export function defineScenario<V>(scenario: Scenario<V>): Scenario {
    return scenario as unknown as Scenario;
}
