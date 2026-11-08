// 기억 탭 헤더. 앱 ScreenHeader(제목형). 상태 표시줄 아래 높이 36, 위 8 · 왼쪽 20 · 오른쪽 12.
// 왼쪽 제목(Title/Card), 오른쪽 설정 톱니(40 버튼 · 아이콘 22).
import type { CSSProperties } from "react";

import { Icon } from "./Icon";
import { STATUS_BAR_HEIGHT } from "./StatusBar";

export const SCREEN_HEADER_BOTTOM = STATUS_BAR_HEIGHT + 36;

export function ScreenHeader({ title }: { title: string }) {
    return (
        <div style={styles.header}>
            <span style={styles.title}>{title}</span>
            <span style={styles.settings}>
                <Icon name="settings" size={22} />
            </span>
        </div>
    );
}

const styles = {
    header: {
        position: "absolute",
        top: STATUS_BAR_HEIGHT,
        left: 0,
        right: 0,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px 0 20px",
    },
    title: {
        font: "var(--type-title-card)",
        letterSpacing: "var(--tracking-title-card)",
    },
    settings: {
        display: "grid",
        placeItems: "center",
        width: 40,
        height: 40,
    },
} satisfies Record<string, CSSProperties>;
