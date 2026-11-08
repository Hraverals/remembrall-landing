// 개발용 시간 패널. import.meta.env.DEV 일 때만 Hero 가 동적 import 한다(배포 빌드에는 이 모듈이 없다).
// 지금 스토리 시각을 보이고, 슬라이더로 그 시각에 멈춘 화면을 본다. ?t=초 로 열면 준비된 뒤 그 시각에 멈춘다(스크린샷용).
// 스타일도 이 파일 안 객체로 두어 배포 CSS 에 들어가지 않게 한다.
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { DEMO_DURATION } from "./story";
import type { useDemoPlayback } from "./useDemoPlayback";

type Props = {
    playback: ReturnType<typeof useDemoPlayback>;
};

export default function DevTimeline({ playback }: Props) {
    const [now, setNow] = useState(0);
    const sought = useRef(false);
    const { ready, seek, time } = playback;

    // 지금 시각을 화면 갱신마다 읽는다.
    useEffect(() => {
        let frame = 0;
        const read = () => {
            setNow(time());
            frame = requestAnimationFrame(read);
        };
        frame = requestAnimationFrame(read);
        return () => cancelAnimationFrame(frame);
    }, [time]);

    // 준비되면 한 번 ?t= 시각으로 간다.
    useEffect(() => {
        if (!ready || sought.current) return;
        sought.current = true;
        const param = new URLSearchParams(location.search).get("t");
        const target = param == null ? NaN : Number(param);
        // 효과 안에서는 flushSync 가 화면을 바로 그리지 못해(대상 위치를 옛 화면에서 잰다) 효과가 끝난 뒤 옮긴다.
        if (Number.isFinite(target)) setTimeout(() => seek(target), 0);
    }, [ready, seek]);

    return (
        <div style={styles.panel} data-dev-timeline>
            <span style={styles.title}>DEV t</span>
            <input
                type="range"
                min={0}
                max={DEMO_DURATION}
                step={0.05}
                value={now}
                disabled={!ready}
                style={styles.range}
                onChange={(event) => {
                    const value = Number(event.target.value);
                    seek(value);
                    const url = new URL(location.href);
                    url.searchParams.set("t", value.toFixed(2));
                    history.replaceState(null, "", url);
                }}
            />
            <span style={styles.value}>{now.toFixed(2)}s</span>
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
        gap: 8,
        padding: "6px 10px",
        border: "1px solid var(--border-default)",
        borderRadius: 10,
        background: "var(--bg-surface)",
        boxShadow: "var(--elevation-low)",
        font: "var(--type-caption)",
    },
    title: {
        color: "var(--text-secondary)",
    },
    range: {
        width: 220,
    },
    value: {
        minWidth: 48,
        fontVariantNumeric: "tabular-nums",
        textAlign: "right",
    },
} satisfies Record<string, CSSProperties>;
