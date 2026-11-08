// 저장물 상태 배지. 앱 C/Badge. 데모에는 "분석 중"만 나온다(status/info-fg on status/info-bg).
import type { CSSProperties } from "react";

const BADGE = {
    analyzing: {
        label: "분석 중",
        color: "var(--status-info-fg)",
        background: "var(--status-info-bg)",
    },
} as const;

export function Badge({ status }: { status: keyof typeof BADGE }) {
    const { label, color, background } = BADGE[status];
    return <span style={{ ...style, color, background }}>{label}</span>;
}

const style: CSSProperties = {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "var(--radius-sm)",
    font: "var(--type-caption)",
};
