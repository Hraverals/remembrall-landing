// 데모 재생 상태. GSAP 지연 로드 · 수명 · 사용자 의도(재생/일시정지)를 맡는다.
// - 데모가 15% 이상 보일 때 timeline.ts 를 동적 import 하고, 화면 밖 · 탭 숨김이면 멈춘다.
// - 동작 줄이기면 GSAP 를 부르지 않고 정지 화면(REDUCED_SNAPSHOT)을 보인다. 불러오기 실패도 같다.
// - 화면은 snapshotAt(time) 의 key 가 바뀔 때만 다시 그린다. 손가락 위치만 바뀌는 동안은 React 를 건드리지 않는다.
import { type RefObject, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { DEMO_DURATION, REDUCED_SNAPSHOT, snapshotAt } from "./story";
import type { DemoPlayback } from "./timeline";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const VISIBLE_RATIO = 0.15;

function prefersReduced(): boolean {
    return window.matchMedia(REDUCE_QUERY).matches;
}

export function useDemoPlayback(root: RefObject<HTMLElement | null>) {
    const [reduced, setReduced] = useState(prefersReduced);
    const [snapshot, setSnapshot] = useState(() => snapshotAt(0));
    const [status, setStatus] = useState({
        ready: false,
        playing: false,
        failed: false,
    });
    const playback = useRef<DemoPlayback | null>(null);
    const key = useRef(snapshot.key);
    const time = useRef(0);
    const intent = useRef(true);
    const visible = useRef(false);

    const publish = (next: number) => {
        time.current = next;
        const nextSnapshot = snapshotAt(next);
        if (key.current !== nextSnapshot.key) {
            key.current = nextSnapshot.key;
            setSnapshot(nextSnapshot);
        }
    };

    const sync = () => {
        const playing = Boolean(
            playback.current &&
            intent.current &&
            visible.current &&
            !document.hidden,
        );
        if (playing) playback.current?.timeline.resume();
        else playback.current?.timeline.pause();
        setStatus((value) =>
            value.playing === playing ? value : { ...value, playing },
        );
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
                const { createDemoTimeline } = await import("./timeline");
                if (!active) return;
                publish(0);
                playback.current = createDemoTimeline(element, publish);
                setStatus({ ready: true, playing: false, failed: false });
                sync();
            } catch (error: unknown) {
                if (!(error instanceof Error)) throw error;
                if (active) {
                    setStatus({ ready: false, playing: false, failed: true });
                }
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
            setStatus((value) => ({ ...value, ready: false, playing: false }));
        };
        // 관찰자 · 타임라인은 이 효과 하나가 맡는다. 콜백은 snapshot 이 아니라 ref 를 읽는다.
    }, [root, reduced]);

    // 화면을 먼저 그려 대상 위치를 잴 수 있게 한 뒤 타임라인을 옮긴다.
    const seek = (next: number) => {
        intent.current = false;
        flushSync(() => publish(next));
        playback.current?.seek(next);
        sync();
    };

    const toggle = () => {
        if (reduced || playback.current == null) return;
        intent.current = !status.playing;
        sync();
    };

    const replay = () => {
        if (reduced || playback.current == null) return;
        seek(0);
        intent.current = true;
        sync();
    };

    return {
        snapshot: reduced || status.failed ? REDUCED_SNAPSHOT : snapshot,
        ready: status.ready,
        playing: status.playing,
        reduced,
        failed: status.failed,
        toggle,
        replay,
        seek,
        // DEV 시간 패널용. 지금 스토리 시각(초).
        time: () => Math.min(time.current, DEMO_DURATION),
    };
}
