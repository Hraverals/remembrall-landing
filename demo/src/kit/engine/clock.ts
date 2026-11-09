// 스토리 시계. snapshotAt(scenario, time) 하나가 그 시각의 화면(층 · 진행 값) · 자막 · 지금 비트를 정한다.
// 순수 함수라 되감기 · 다시 보기 · 비트 이동에 상태가 남지 않는다. landing demo/story.ts 를 시나리오와 무관하게 나눈 것이다.
// view 안의 숫자는 0.02 단위로 끊어 key 에 넣는다. React 는 key 가 바뀔 때만 다시 그리므로 전환 구간에서만 프레임마다 그린다.
// 마지막 비트 끝 ~ duration 은 처음 화면으로 돌아가는 크로스페이드다(loop 가 t=0 과 이어진다).
import type { Scenario } from "./types";

export function easeInOutCubic(p: number): number {
    return p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
}

// Reanimated withTiming 의 기본 easing(Easing.inOut(Easing.quad)). 앱 애니메이션 시간을 그대로 옮길 때 쓴다.
export function easeInOutQuad(p: number): number {
    return p < 0.5 ? 2 * p ** 2 : 1 - (-2 * p + 2) ** 2 / 2;
}

// start 부터 duration 동안 0 → 1 (기본 easeInOutCubic).
export function progress(
    time: number,
    start: number,
    duration: number,
    ease: (p: number) => number = easeInOutCubic,
): number {
    return ease(Math.max(0, Math.min(1, (time - start) / duration)));
}

function quantize(value: number): number {
    return Math.round(value * 50) / 50;
}

// view 안의 숫자를 모두 끊는다(정수 · 문자열 · 불리언은 그대로).
function quantizeDeep(value: unknown): unknown {
    if (typeof value === "number") return quantize(value);
    if (Array.isArray(value)) return value.map(quantizeDeep);
    if (value != null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                quantizeDeep(item),
            ]),
        );
    }
    return value;
}

export type Layer = { key: string; view: unknown; opacity: number };
export type Caption = { text: string; opacity: number };

export type Snapshot = {
    key: string;
    // 지금 비트(첫 비트 전이면 -1). 처음으로 돌아가는 구간에서는 마지막 비트다.
    beat: number;
    // 이 snapshot 을 만든 시각. key 에는 들어가지 않는다.
    time: number;
    layers: readonly Layer[];
    captions: readonly Caption[];
    // 옆 설명 층 상태(scenario.aside 가 있을 때만).
    aside?: unknown;
};

const CAPTION_FADE = 0.25;

function lastIndexAtOrBefore(cues: readonly { at: number }[], time: number) {
    let index = -1;
    cues.forEach((cue, i) => {
        if (cue.at <= time) index = i;
    });
    return index;
}

export function lastBeatEnd(scenario: Scenario): number {
    return scenario.beats[scenario.beats.length - 1]?.end ?? 0;
}

function segmentLayers(scenario: Scenario, time: number): Layer[] {
    const { segments } = scenario;
    const index = Math.max(0, lastIndexAtOrBefore(segments, time));
    const current = segments[index];
    const previous = segments[index - 1];
    if (current == null) return [];
    const mix =
        previous != null && current.xfade > 0
            ? Math.min(1, (time - current.at) / current.xfade)
            : 1;
    const layers: Layer[] = [
        { key: `seg-${index}`, view: current.view(time), opacity: mix },
    ];
    if (previous != null && mix < 1) {
        layers.unshift({
            key: `seg-${index - 1}`,
            view: previous.view(time),
            opacity: 1 - mix,
        });
    }
    return layers;
}

function layersAt(scenario: Scenario, time: number): Layer[] {
    const end = lastBeatEnd(scenario);
    if (time <= end || scenario.duration <= end) {
        return segmentLayers(scenario, time);
    }
    // 처음으로 돌아가는 구간: 마지막 비트 끝 화면 위로 t=0 화면을 올린다.
    const mix = Math.min(1, (time - end) / (scenario.duration - end));
    const from = segmentLayers(scenario, end).map((layer) => ({
        ...layer,
        opacity: layer.opacity * (1 - mix),
    }));
    const to = segmentLayers(scenario, 0).map((layer) => ({
        ...layer,
        key: `loop-${layer.key}`,
        opacity: layer.opacity * mix,
    }));
    return [...from, ...to];
}

function captionsAt(scenario: Scenario, time: number): Caption[] {
    const { beats } = scenario;
    const cues = beats.map((beat) => ({ at: beat.start, text: beat.caption }));
    const first = beats[0];
    if (first != null && scenario.duration > lastBeatEnd(scenario)) {
        cues.push({ at: lastBeatEnd(scenario), text: first.caption });
    }
    const index = Math.max(0, lastIndexAtOrBefore(cues, time));
    const current = cues[index];
    const previous = cues[index - 1];
    if (current == null) return [];
    const mix =
        previous != null ? Math.min(1, (time - current.at) / CAPTION_FADE) : 1;
    return previous != null && mix < 1 && previous.text !== current.text
        ? [
              { text: previous.text, opacity: 1 - mix },
              { text: current.text, opacity: mix },
          ]
        : [{ text: current.text, opacity: 1 }];
}

export function beatAt(scenario: Scenario, time: number): number {
    return lastIndexAtOrBefore(
        scenario.beats.map((beat) => ({ at: beat.start })),
        time,
    );
}

export function snapshotAt(scenario: Scenario, time: number): Snapshot {
    const t = Math.max(0, Math.min(scenario.duration, time));
    const layers = layersAt(scenario, t)
        .map((layer) => ({
            key: layer.key,
            view: quantizeDeep(layer.view),
            opacity: quantize(layer.opacity),
        }))
        .filter((layer) => layer.opacity > 0);
    const captions = captionsAt(scenario, t).map((caption) => ({
        ...caption,
        opacity: quantize(caption.opacity),
    }));
    const beat = beatAt(scenario, t);
    const aside =
        scenario.aside == null
            ? undefined
            : quantizeDeep(scenario.aside.view(t));
    return {
        key: JSON.stringify([beat, layers, captions, aside]),
        beat,
        time: t,
        layers,
        captions,
        aside,
    };
}
