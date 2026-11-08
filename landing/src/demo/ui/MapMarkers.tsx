// 지도 위 요소. 08 · 지도 탭이 같이 쓴다. 좌표는 360×800 논리 px.
// - PhotoPin: 앱 PhotoMarker. 9:16, 폭 · 테두리는 바램으로 정한다(recent 40/3 · weeks 26/2 · months 22/2).
//   variant detail(08 장소 핀)은 바램과 관계없이 40/3. 그림자는 recent 핀과 detail 핀에만 있다. 좌표는 핀 아래 가운데다.
// - PinLabel: 핀 아래 7 떨어진 이름표(text/primary 바탕).
// - CurrentLocation: 바깥 원 44(status/info-fg 15%) · 안쪽 점 14(bg/surface 테두리 3).
// - RouteLine: 지금 위치 → 장소 점선(text/secondary 2, 점선 4 · 4).
import type { CSSProperties } from "react";

import { photo, type PhotoId } from "../../assets/photos";
import { FADE_OPACITY } from "../album";
import type { Point } from "../geo";
import type { Fade } from "./Thumb";

const PIN_SIZE: Record<Fade | "detail", { width: number; border: number }> = {
    recent: { width: 40, border: 3 },
    weeks: { width: 26, border: 2 },
    months: { width: 22, border: 2 },
    detail: { width: 40, border: 3 },
};

type PinProps = Point & {
    photo: PhotoId;
    fade: Fade;
    variant?: "detail";
};

export function PhotoPin({ x, y, photo: id, fade, variant }: PinProps) {
    const { width, border } = PIN_SIZE[variant ?? fade];
    const height = (width * 16) / 9;
    const raised = variant === "detail" || fade === "recent";
    return (
        <div
            style={{
                ...styles.pin,
                left: x - width / 2,
                top: y - height,
                width,
                height,
                borderWidth: border,
                boxShadow: raised ? "var(--elevation-low)" : undefined,
            }}
        >
            <img src={photo(id, "sm")} alt="" style={styles.fill} />
            <span
                data-fade={fade}
                style={{
                    ...styles.fill,
                    ...styles.fade,
                    opacity: FADE_OPACITY[fade],
                }}
            />
        </div>
    );
}

export function PinLabel({ x, y, label }: Point & { label: string }) {
    return <div style={{ ...styles.label, left: x, top: y + 7 }}>{label}</div>;
}

export function CurrentLocation({ x, y }: Point) {
    return (
        <div style={{ ...styles.current, left: x - 22, top: y - 22 }}>
            <span style={styles.halo} />
            <span style={styles.dot} />
        </div>
    );
}

export function RouteLine({ from, to }: { from: Point; to: Point }) {
    return (
        <svg width="360" height="800" style={styles.route}>
            <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--text-secondary)"
                strokeWidth="2"
                strokeDasharray="4 4"
            />
        </svg>
    );
}

const styles = {
    pin: {
        position: "absolute",
        overflow: "hidden",
        borderStyle: "solid",
        borderColor: "var(--bg-surface)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-placeholder)",
    },
    fill: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    fade: {
        background: "var(--bg-fade)",
    },
    label: {
        position: "absolute",
        transform: "translateX(-50%)",
        padding: "3px 8px",
        borderRadius: "var(--radius-full)",
        background: "var(--text-primary)",
        color: "var(--text-on-primary)",
        font: "var(--type-caption)",
        whiteSpace: "nowrap",
    },
    current: {
        position: "absolute",
        width: 44,
        height: 44,
        display: "grid",
        placeItems: "center",
    },
    halo: {
        position: "absolute",
        inset: 0,
        borderRadius: "var(--radius-full)",
        background: "var(--status-info-fg)",
        opacity: 0.15,
    },
    dot: {
        position: "relative",
        width: 14,
        height: 14,
        borderRadius: "var(--radius-full)",
        border: "3px solid var(--bg-surface)",
        background: "var(--status-info-fg)",
    },
    route: {
        position: "absolute",
        inset: 0,
    },
} satisfies Record<string, CSSProperties>;
