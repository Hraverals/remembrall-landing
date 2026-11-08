// 안드로이드 시스템 바. 위 상태 표시줄(시각 · 카메라 구멍 · 신호 · 와이파이 · 배터리)과 아래 제스처 막대.
// 특정 기기를 따라 그리지 않는다. tone 은 바탕에 따라 글자 색을 바꾼다(dark: 밝은 바탕 위 진한 글자).
import type { CSSProperties } from "react";

export const STATUS_BAR_HEIGHT = 28;
export const NAV_BAR_HEIGHT = 20;

type Tone = "dark" | "light";

const INK: Record<Tone, string> = {
    dark: "var(--text-primary)",
    light: "var(--text-on-primary)",
};

export function StatusBar({ tone = "dark" }: { tone?: Tone }) {
    const ink = INK[tone];
    return (
        <div style={{ ...styles.status, color: ink }}>
            <span style={styles.time}>2:14</span>
            <span style={styles.camera} />
            <span style={styles.indicators}>
                <svg width="14" height="12" viewBox="0 0 14 12">
                    <path d="M13 0.5V11.5H1.5L13 0.5Z" fill={ink} />
                </svg>
                <svg width="14" height="12" viewBox="0 0 14 12">
                    <path
                        d="M7 11.5L0.4 4.2A9.6 9.6 0 0 1 13.6 4.2L7 11.5Z"
                        fill={ink}
                    />
                </svg>
                <svg width="8" height="13" viewBox="0 0 8 13">
                    <rect
                        x="0.6"
                        y="1.6"
                        width="6.8"
                        height="10.8"
                        rx="1.4"
                        fill="none"
                        stroke={ink}
                        strokeWidth="1.2"
                    />
                    <rect x="2.6" y="0" width="2.8" height="1.6" fill={ink} />
                    <rect
                        x="1.8"
                        y="4.6"
                        width="4.4"
                        height="6.6"
                        rx="0.6"
                        fill={ink}
                    />
                </svg>
            </span>
        </div>
    );
}

export function NavigationBar({ tone = "dark" }: { tone?: Tone }) {
    return (
        <div style={styles.nav}>
            <span style={{ ...styles.handle, background: INK[tone] }} />
        </div>
    );
}

const styles = {
    status: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height: STATUS_BAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: 20,
        pointerEvents: "none",
    },
    time: {
        font: "500 13px / 16px var(--font-body)",
        fontVariantNumeric: "tabular-nums",
    },
    camera: {
        position: "absolute",
        top: 8,
        left: "50%",
        width: 12,
        height: 12,
        marginLeft: -6,
        borderRadius: "var(--radius-full)",
        background: "var(--text-primary)",
    },
    indicators: {
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    nav: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        height: NAV_BAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
    },
    handle: {
        width: 108,
        height: 4,
        borderRadius: 2,
        opacity: 0.85,
    },
} satisfies Record<string, CSSProperties>;
