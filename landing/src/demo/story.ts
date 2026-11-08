// 데모 스토리 시계. snapshotAt(time) 하나가 그 시각의 화면(층 · 진행 값)과 자막을 정한다. 순수 함수라 되감기 · 다시 보기에 상태가 남지 않는다.
// 진행 값(시트 · 바램 · 걷기 · 알림창)은 0.02 단위로 끊어 key 에 넣는다. React 는 key 가 바뀔 때만 다시 그리므로 전환 구간에서만 프레임마다 그린다.
// 손가락 · 클릭 링 · 카메라 · 배경 카드 · 진행 막대는 GSAP 타임라인(timeline.ts)이 맡는다. 탭 · 끌기 시각은 여기 TAPS · DRAG 를 같이 쓴다.
//
// 흐름(1배속, 한 바퀴 24.7초):
//   0      Shorts → 1.4 공유 탭 → 1.6 공유 시트 → 3.0 Remembrall 탭
//   3.25   지도(T0) 위 받음 시트 "저장하고 있어요" → 5.1 "저장했어요" → 6.5 "기억 탭 보기" 탭
//   6.7    기억 탭 분석 중 → 8.6 성심당 본점 → 10.0 자막 "3주 뒤" → 10.3 바램 진행 → 11.6 3주 뒤 배치
//   13.6   지도 탭 탭 → 13.8 지도(3주 뒤) → 14.4 걷기 → 17.4 알림 아이콘 → 18.6 알림창 끌어내림 → 20.0 알림 탭
//   20.2   08(바램 30%) → 20.9 원래 색으로(0.6초) → 손가락 없이 머묾 → 24.3 Shorts 로 0.4초 크로스페이드(t=0 과 이어짐)

export const DEMO_DURATION = 24.7;

export type SceneView =
    | { kind: "shorts"; sheet: number }
    | {
          kind: "received";
          status: "saving" | "saved";
          enter: number;
          text: number;
      }
    | {
          kind: "archive";
          analyzing: boolean;
          fade: number;
          layout: "now" | "later";
      }
    | { kind: "map"; walk: number; notified: boolean; pull: number }
    | { kind: "detail"; fade: number };

export type DemoSnapshot = {
    key: string;
    layers: readonly { view: SceneView; opacity: number }[];
    captions: readonly { text: string; opacity: number }[];
};

// 탭: move 에 대상으로 움직이기 시작해 at 에 누른다. 대상은 data-demo-target 이다.
export const TAPS: readonly { target: string; at: number; move: number }[] = [
    { target: "share", move: 0.7, at: 1.4 },
    { target: "share-app", move: 2.3, at: 3.0 },
    { target: "open-archive", move: 5.8, at: 6.5 },
    { target: "tab-map", move: 12.9, at: 13.6 },
    { target: "notification", move: 19.6, at: 20.0 },
];

// 끌기: 상태 표시줄 알림 아이콘에서 아래로. 알림창(pull)도 같은 시각 · 같은 easing 으로 내려온다.
export const DRAG = {
    from: "notification-icon",
    to: { x: 180, y: 300 },
    at: 18.6,
    duration: 0.7,
} as const;

// 손가락이 보이는 구간. 마지막 알림 탭 뒤로는 손가락이 없다.
export const POINTER_VISIBLE: readonly (readonly [number, number])[] = [
    [0.5, 1.7],
    [2.1, 3.3],
    [5.6, 6.8],
    [12.7, 13.9],
    [18.1, 20.3],
];

export function easeInOutCubic(p: number): number {
    return p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
}

// start 부터 duration 동안 0 → 1 (easeInOutCubic).
function progress(time: number, start: number, duration: number): number {
    return easeInOutCubic(Math.max(0, Math.min(1, (time - start) / duration)));
}

function quantize(value: number): number {
    return Math.round(value * 50) / 50;
}

const CAPTION = {
    share: "Shorts에서 마음에 든 곳을 공유해요",
    found: "어디인지 찾으면 기억 탭에 남아요",
    later: "3주 뒤, 사진이 조금 바래 있어요",
    nearby: "그 근처에 가면 다시 꺼내드려요",
    restored: "누르면 원래 색으로 돌아와요",
} as const;

const CAPTION_CUES: readonly { at: number; text: string }[] = [
    { at: 0, text: CAPTION.share },
    { at: 6.7, text: CAPTION.found },
    { at: 10.0, text: CAPTION.later },
    { at: 13.8, text: CAPTION.nearby },
    { at: 20.2, text: CAPTION.restored },
    { at: 24.3, text: CAPTION.share },
];
const CAPTION_FADE = 0.25;

// 장면 구간. 앞 구간과 xfade 초 동안 크로스페이드한다.
type Segment = {
    at: number;
    xfade: number;
    view: (time: number) => SceneView;
};

const SEGMENTS: readonly Segment[] = [
    {
        at: 0,
        xfade: 0,
        view: (t) => ({ kind: "shorts", sheet: progress(t, 1.6, 0.35) }),
    },
    {
        at: 3.25,
        xfade: 0.2,
        view: (t) => ({
            kind: "received",
            status: t < 5.1 ? "saving" : "saved",
            enter: progress(t, 3.25, 0.35),
            text: progress(t, 5.1, 0.2),
        }),
    },
    {
        at: 6.7,
        xfade: 0.25,
        view: (t) => ({
            kind: "archive",
            analyzing: t < 8.6,
            fade: progress(t, 10.3, 1.2),
            layout: "now",
        }),
    },
    {
        at: 11.6,
        xfade: 0.3,
        view: (t) => ({
            kind: "archive",
            analyzing: false,
            fade: progress(t, 10.3, 1.2),
            layout: "later",
        }),
    },
    {
        at: 13.8,
        xfade: 0.25,
        view: (t) => ({
            kind: "map",
            walk: progress(t, 14.4, 2.8),
            notified: t >= 17.4,
            pull: progress(t, DRAG.at, DRAG.duration),
        }),
    },
    {
        at: 20.2,
        xfade: 0.25,
        view: (t) => ({
            kind: "detail",
            fade: 0.3 * (1 - progress(t, 20.9, 0.6)),
        }),
    },
    {
        at: 24.3,
        xfade: 0.4,
        view: () => ({ kind: "shorts", sheet: 0 }),
    },
];

function lastIndexAtOrBefore(cues: readonly { at: number }[], time: number) {
    let index = 0;
    cues.forEach((cue, i) => {
        if (cue.at <= time) index = i;
    });
    return index;
}

function layersAt(time: number): DemoSnapshot["layers"] {
    const index = lastIndexAtOrBefore(SEGMENTS, time);
    const current = SEGMENTS[index];
    const previous = SEGMENTS[index - 1];
    if (current == null) return [];
    const mix =
        previous != null && current.xfade > 0
            ? Math.min(1, (time - current.at) / current.xfade)
            : 1;
    const layers = [{ view: current.view(time), opacity: mix }];
    if (previous != null && mix < 1) {
        layers.unshift({ view: previous.view(time), opacity: 1 - mix });
    }
    return layers;
}

function captionsAt(time: number): DemoSnapshot["captions"] {
    const index = lastIndexAtOrBefore(CAPTION_CUES, time);
    const current = CAPTION_CUES[index];
    const previous = CAPTION_CUES[index - 1];
    if (current == null) return [];
    const mix =
        previous != null ? Math.min(1, (time - current.at) / CAPTION_FADE) : 1;
    return previous != null && mix < 1
        ? [
              { text: previous.text, opacity: 1 - mix },
              { text: current.text, opacity: mix },
          ]
        : [{ text: current.text, opacity: 1 }];
}

function quantizeView(view: SceneView): SceneView {
    switch (view.kind) {
        case "shorts":
            return { ...view, sheet: quantize(view.sheet) };
        case "received":
            return {
                ...view,
                enter: quantize(view.enter),
                text: quantize(view.text),
            };
        case "archive":
            return { ...view, fade: quantize(view.fade) };
        case "map":
            return {
                ...view,
                walk: quantize(view.walk),
                pull: quantize(view.pull),
            };
        case "detail":
            return { ...view, fade: quantize(view.fade) };
    }
}

function withKey(
    layers: DemoSnapshot["layers"],
    captions: DemoSnapshot["captions"],
): DemoSnapshot {
    return { key: JSON.stringify([layers, captions]), layers, captions };
}

export function snapshotAt(time: number): DemoSnapshot {
    const t = Math.max(0, Math.min(DEMO_DURATION, time));
    const layers = layersAt(t).map((layer) => ({
        view: quantizeView(layer.view),
        opacity: quantize(layer.opacity),
    }));
    const captions = captionsAt(t).map((caption) => ({
        ...caption,
        opacity: quantize(caption.opacity),
    }));
    return withKey(layers, captions);
}

// 동작 줄이기 · GSAP 실패 때 정지 화면: 08 원래 색, 자막 7.
export const REDUCED_SNAPSHOT: DemoSnapshot = withKey(
    [{ view: { kind: "detail", fade: 0 }, opacity: 1 }],
    [{ text: CAPTION.restored, opacity: 1 }],
);
