// 개발용 장면 스위치. import.meta.env.DEV 일 때만 Hero 가 동적 import 한다(배포 빌드에는 이 모듈이 없다).
// 오른쪽 아래 작은 패널: 프레임 목록, 이전 · 다음, 키보드 [ · ]. 주소의 ?frame= 과 맞춘다(스크린샷용).
// 스타일도 이 파일 안 객체로 두어 배포 CSS 에 들어가지 않게 한다.
import { type CSSProperties, useEffect } from "react";

import { DEMO_FRAMES, type DemoFrameId } from "./frames";

type Props = {
    frame: DemoFrameId;
    onChange: (frame: DemoFrameId) => void;
};

function isFrameId(value: string | null): value is DemoFrameId {
    return DEMO_FRAMES.some((item) => item.id === value);
}

// 주소에 남기는 일은 사용자가 고를 때만 한다. 효과로 쓰면 StrictMode 가 처음 읽기를 다시 돌릴 때 덮어쓴 값을 읽는다.
function writeFrameParam(frame: DemoFrameId) {
    const url = new URL(location.href);
    url.searchParams.set("frame", frame);
    history.replaceState(null, "", url);
}

export default function DevSceneSwitch({ frame, onChange }: Props) {
    // 처음 한 번 주소의 프레임으로 맞춘다. 주소를 바꾸지 않아 다시 돌아도 같은 값이다.
    useEffect(() => {
        const param = new URLSearchParams(location.search).get("frame");
        if (isFrameId(param)) onChange(param);
        // 처음 한 번만 읽는다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const index = DEMO_FRAMES.findIndex((item) => item.id === frame);
    const choose = (next: DemoFrameId) => {
        writeFrameParam(next);
        onChange(next);
    };
    const step = (delta: number) => {
        const next =
            DEMO_FRAMES[
                (index + delta + DEMO_FRAMES.length) % DEMO_FRAMES.length
            ];
        if (next != null) choose(next.id);
    };

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== "[" && event.key !== "]") return;
            const next =
                DEMO_FRAMES[
                    (index +
                        (event.key === "]" ? 1 : -1) +
                        DEMO_FRAMES.length) %
                        DEMO_FRAMES.length
                ];
            if (next == null) return;
            writeFrameParam(next.id);
            onChange(next.id);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [index, onChange]);

    return (
        <div style={styles.panel} data-dev-scene-switch>
            <span style={styles.title}>DEV 장면</span>
            <button
                type="button"
                style={styles.button}
                onClick={() => step(-1)}
            >
                ‹
            </button>
            <select
                style={styles.select}
                value={frame}
                onChange={(event) => {
                    const value = event.target.value;
                    if (isFrameId(value)) choose(value);
                }}
            >
                {DEMO_FRAMES.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.scene} · {item.label}
                    </option>
                ))}
            </select>
            <button type="button" style={styles.button} onClick={() => step(1)}>
                ›
            </button>
        </div>
    );
}

const styles = {
    panel: {
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 8px",
        border: "1px solid var(--border-default)",
        borderRadius: 10,
        background: "var(--bg-surface)",
        boxShadow: "var(--elevation-low)",
        font: "var(--type-caption)",
    },
    title: {
        color: "var(--text-secondary)",
    },
    button: {
        width: 28,
        height: 28,
        border: "1px solid var(--border-default)",
        borderRadius: 6,
        background: "var(--bg-screen)",
        font: "inherit",
        cursor: "pointer",
    },
    select: {
        height: 28,
        font: "inherit",
    },
} satisfies Record<string, CSSProperties>;
