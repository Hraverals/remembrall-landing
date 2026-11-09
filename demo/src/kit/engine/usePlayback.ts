// 시나리오 재생 상태. GSAP 지연 로드 · 수명 · 비트 제어를 맡는다. landing demo/useDemoPlayback.ts 를 비트 단위로 바꾼 것이다.
// - 15% 이상 보일 때 timeline.ts 를 동적 import 하고, 화면 밖 · 탭 숨김이면 멈춘다.
// - 동작 줄이기면 GSAP 를 부르지 않고 정지 화면을 보인다. 불러오기 실패도 같다.
//   정지 화면: at 이 있으면 그 시각, step 은 지금 비트의 끝(-1 이면 t=0), loop 는 마지막 비트의 끝.
// - step: beat 가 커지면 그 비트의 처음부터 끝까지 재생하고 멈춘 뒤 onBeatEnd. 작아지면 그 비트의 끝 상태로 바로 간다.
//   처음 준비됐을 때는 지금 비트를 처음부터 재생한다. 두 칸 이상 건너뛰어도 마지막 비트만 재생한다.
// - loop: 전체를 반복한다. 비트 끝을 지날 때마다 onBeatEnd.
// - at: 이 시각에 멈춘 화면(개발 · 스크린샷용). mode 보다 앞선다.
// - 화면은 snapshotAt(time) 의 key 가 바뀔 때만 다시 그린다. 손가락 위치만 바뀌는 동안은 React 를 건드리지 않는다.
// 한 인스턴스에서 scenario · mode 는 바뀌지 않는다고 본다(ScenarioPhone · ScenarioStage 가 바뀌면 key 로 새로 만든다).
import {
    type RefObject,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";

import { lastBeatEnd, snapshotAt } from "./clock";
import type { ScenarioTimeline } from "./timeline";
import type { Scenario } from "./types";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const VISIBLE_RATIO = 0.15;

export type PlaybackOptions = {
    scenario: Scenario;
    mode: "step" | "loop";
    beat?: number;
    speed?: number;
    onBeatEnd?: (beat: number) => void;
    at?: number;
};

function prefersReduced(): boolean {
    return window.matchMedia(REDUCE_QUERY).matches;
}

function clampBeat(scenario: Scenario, beat: number): number {
    return Math.max(-1, Math.min(scenario.beats.length - 1, Math.floor(beat)));
}

// GSAP 이 준비되기 전 화면 · 정지 화면의 시각.
function startTime(options: PlaybackOptions): number {
    const { scenario, mode, at } = options;
    if (at != null) return at;
    if (mode === "loop") return 0;
    return scenario.beats[clampBeat(scenario, options.beat ?? 0)]?.start ?? 0;
}

function stillTime(options: PlaybackOptions): number {
    const { scenario, mode, at } = options;
    if (at != null) return at;
    if (mode === "loop") return lastBeatEnd(scenario);
    return scenario.beats[clampBeat(scenario, options.beat ?? 0)]?.end ?? 0;
}

export function usePlayback(
    root: RefObject<HTMLElement | null>,
    options: PlaybackOptions,
) {
    const { scenario, mode, beat = 0, speed = 1, at } = options;
    const [reduced, setReduced] = useState(prefersReduced);
    const [snapshot, setSnapshot] = useState(() =>
        snapshotAt(scenario, startTime(options)),
    );
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    const playback = useRef<ScenarioTimeline | null>(null);
    const key = useRef(snapshot.key);
    const visible = useRef(false);
    // step: 재생 중인 비트와 멈출 시각. null 이면 멈춰 있다.
    const stepping = useRef<{ beat: number; end: number } | null>(null);
    // step: 마지막으로 맞춘 비트(처음 준비 전에는 null).
    const applied = useRef<number | null>(null);
    const lastTick = useRef(0);
    // 콜백 · 미룬 apply 가 읽는 지금 props. 다른 효과보다 먼저(레이아웃 효과) 맞춘다.
    const latest = useRef(options);
    useLayoutEffect(() => {
        latest.current = options;
    });

    const publish = (time: number) => {
        const next = snapshotAt(scenario, time);
        if (key.current !== next.key) {
            key.current = next.key;
            setSnapshot(next);
        }
    };

    const wantsPlay = () =>
        latest.current.at == null &&
        (mode === "loop" || stepping.current != null);

    const sync = () => {
        const playing = Boolean(
            playback.current &&
            wantsPlay() &&
            visible.current &&
            !document.hidden,
        );
        if (playing) playback.current?.timeline.resume();
        else playback.current?.timeline.pause();
    };

    const onTick = (time: number) => {
        const previous = lastTick.current;
        lastTick.current = time;
        const step = stepping.current;
        if (step != null) {
            if (time >= step.end) {
                stepping.current = null;
                playback.current?.stop(step.end);
                lastTick.current = step.end;
                publish(step.end);
                latest.current.onBeatEnd?.(step.beat);
                return;
            }
        } else if (mode === "loop" && time >= previous) {
            scenario.beats.forEach((item, index) => {
                if (previous < item.end && item.end <= time) {
                    latest.current.onBeatEnd?.(index);
                }
            });
        }
        publish(time);
    };

    // 화면을 먼저 그려 대상 위치를 잴 수 있게 한 뒤 타임라인을 옮긴다. 효과 안에서는 부르지 않는다(apply 가 미룬다).
    const seek = (time: number) => {
        flushSync(() => publish(time));
        lastTick.current = time;
        playback.current?.seek(time);
    };

    // 지금 props 에 맞춰 타임라인을 옮긴다.
    const apply = () => {
        if (playback.current == null) return;
        const current = latest.current;
        if (current.at != null) {
            stepping.current = null;
            applied.current = null;
            seek(current.at);
        } else if (mode === "loop") {
            if (applied.current == null) {
                applied.current = 0;
                seek(0);
            }
        } else {
            const next = clampBeat(scenario, current.beat ?? 0);
            const previous = applied.current;
            applied.current = next;
            const target = scenario.beats[next];
            if (target == null) {
                stepping.current = null;
                seek(0);
            } else if (previous == null || next > previous) {
                stepping.current = null;
                seek(target.start);
                stepping.current = { beat: next, end: target.end };
            } else if (next < previous) {
                stepping.current = null;
                seek(target.end);
            }
        }
        sync();
    };

    // 동작 줄이기 설정이 바뀌면 따른다.
    useEffect(() => {
        const motion = window.matchMedia(REDUCE_QUERY);
        const onChange = () => setReduced(motion.matches);
        motion.addEventListener("change", onChange);
        return () => motion.removeEventListener("change", onChange);
    }, []);

    // 타임라인 하나를 이 효과가 맡는다. 동작 줄이기면 아무것도 하지 않는다.
    useEffect(() => {
        const element = root.current;
        if (element == null || reduced) return;
        let active = true;
        let loading = false;

        const load = async () => {
            if (loading || playback.current) return;
            loading = true;
            try {
                const { createScenarioTimeline } = await import("./timeline");
                if (!active) return;
                playback.current = createScenarioTimeline(
                    element,
                    scenario,
                    { loop: mode === "loop" },
                    onTick,
                );
                playback.current.timeline.timeScale(latest.current.speed ?? 1);
                setReady(true);
            } catch (error: unknown) {
                if (!(error instanceof Error)) throw error;
                if (active) setFailed(true);
            }
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                visible.current = Boolean(
                    entry?.isIntersecting &&
                    entry.intersectionRatio >= VISIBLE_RATIO,
                );
                if (visible.current) void load();
                sync();
            },
            { threshold: [0, VISIBLE_RATIO] },
        );
        observer.observe(element);
        document.addEventListener("visibilitychange", sync);

        return () => {
            active = false;
            observer.disconnect();
            document.removeEventListener("visibilitychange", sync);
            playback.current?.dispose();
            playback.current = null;
            stepping.current = null;
            applied.current = null;
            setReady(false);
        };
        // 관찰자 · 타임라인은 이 효과 하나가 맡는다. 콜백은 snapshot 이 아니라 ref 를 읽는다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [root, reduced]);

    // 준비되면, 그리고 beat · at 이 바뀔 때마다 맞춘다. flushSync 를 쓰므로 효과가 끝난 뒤로 미룬다.
    useEffect(() => {
        if (!ready) return;
        const timer = setTimeout(apply, 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, beat, at]);

    useEffect(() => {
        playback.current?.timeline.timeScale(speed);
    }, [ready, speed]);

    // 정지 화면에서도 step 비트는 바로 끝난 것으로 알린다.
    const still = reduced || failed;
    useEffect(() => {
        if (!still || mode !== "step" || at != null) return;
        const index = clampBeat(scenario, beat);
        if (index >= 0) latest.current.onBeatEnd?.(index);
    }, [still, mode, at, scenario, beat]);

    return {
        snapshot: still ? snapshotAt(scenario, stillTime(options)) : snapshot,
        ready,
        reduced,
        failed,
    };
}
