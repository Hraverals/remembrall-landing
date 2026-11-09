// 지도 바탕. 앱 Google 지도 화면은 쓸 수 없어 앱 mapStyle 의 색으로 추상 지도를 그린다(은행동 일대 골목과 대전천 느낌).
// 땅 bg/screen, 도로 bg/surface, 물 status/info-bg, 동네 · 물 이름 text/secondary(바탕색 테두리). 가게 · 도로 이름 · 로고는 없다.
// 360×800 논리 px 화면 전체를 덮는다. 핀 · 현재 위치는 장면이 위에 올린다.
import type { CSSProperties } from "react";

const ROADS: readonly { width: number; d: string }[] = [
    // 큰길
    { width: 14, d: "M-20 476 L380 252" },
    { width: 12, d: "M126 -20 L150 820" },
    { width: 10, d: "M-20 130 L380 104" },
    // 작은 길
    { width: 7, d: "M-20 332 L380 356" },
    { width: 7, d: "M236 -20 L254 820" },
    { width: 7, d: "M-20 650 L380 612" },
    { width: 7, d: "M58 -20 L70 820" },
    // 골목
    { width: 4, d: "M150 194 L236 188" },
    { width: 4, d: "M70 252 L144 248" },
    { width: 4, d: "M192 110 L198 336" },
    { width: 4, d: "M254 236 L304 232" },
    { width: 4, d: "M150 270 L196 268" },
    { width: 4, d: "M70 420 L140 416" },
    { width: 4, d: "M150 520 L250 540" },
    { width: 4, d: "M96 336 L100 640" },
    { width: 4, d: "M196 400 L204 620" },
    { width: 4, d: "M254 450 L300 446" },
    { width: 4, d: "M0 560 L66 556" },
    { width: 4, d: "M150 728 L252 716" },
];

const LABELS: readonly {
    text: string;
    x: number;
    y: number;
    rotate?: number;
}[] = [
    { text: "선화동", x: 66, y: 100 },
    { text: "은행동", x: 160, y: 158 },
    { text: "대흥동", x: 22, y: 540 },
    { text: "대전천", x: 334, y: 470, rotate: 82 },
];

export function DemoMap() {
    return (
        <svg width="360" height="800" viewBox="0 0 360 800" style={styles.map}>
            <rect width="360" height="800" fill="var(--bg-screen)" />
            <path
                d="M318 -20 C300 120 338 240 314 380 S300 620 332 820"
                fill="none"
                stroke="var(--status-info-bg)"
                strokeWidth="26"
            />
            <g fill="none" stroke="var(--bg-surface)" strokeLinecap="round">
                {ROADS.map((road) => (
                    <path key={road.d} d={road.d} strokeWidth={road.width} />
                ))}
            </g>
            <g style={styles.labels}>
                {LABELS.map((label) => (
                    <text
                        key={label.text}
                        x={label.x}
                        y={label.y}
                        transform={
                            label.rotate == null
                                ? undefined
                                : `rotate(${label.rotate} ${label.x} ${label.y})`
                        }
                    >
                        {label.text}
                    </text>
                ))}
            </g>
        </svg>
    );
}

const styles = {
    map: {
        position: "absolute",
        inset: 0,
    },
    labels: {
        font: "var(--type-caption)",
        fill: "var(--text-secondary)",
        stroke: "var(--bg-screen)",
        strokeWidth: 3,
        strokeLinejoin: "round",
        paintOrder: "stroke",
    },
} satisfies Record<string, CSSProperties>;
