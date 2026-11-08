// 하단 바 "근처 / 지도 / 기억". 앱 C/BottomNav. 선택 표시는 bg/subtle pill 이고 브랜드 색을 쓰지 않는다.
// 위 테두리 1 · 위 8 · pill(4 + 아이콘 22 + 4) · 간격 2 · 라벨 16 · 아래 8 + 제스처 막대 자리.
import type { CSSProperties } from "react";

import { Icon, type IconName } from "./Icon";
import { NAV_BAR_HEIGHT } from "./StatusBar";

export const BOTTOM_NAV_HEIGHT = 1 + 8 + 30 + 2 + 16 + 8 + NAV_BAR_HEIGHT;

type TabKey = "nearby" | "map" | "archive";

const TABS: readonly { key: TabKey; label: string; icon: IconName }[] = [
    { key: "nearby", label: "근처", icon: "footprints" },
    { key: "map", label: "지도", icon: "map" },
    { key: "archive", label: "기억", icon: "images" },
];

export function BottomNav({ active }: { active: TabKey }) {
    return (
        <div style={styles.bar}>
            {TABS.map(({ key, label, icon }) => {
                const selected = key === active;
                return (
                    <div key={key} style={styles.tab}>
                        <span
                            style={{
                                ...styles.indicator,
                                background: selected
                                    ? "var(--bg-subtle)"
                                    : "var(--bg-surface)",
                            }}
                        >
                            <Icon
                                name={icon}
                                size={22}
                                color={
                                    selected
                                        ? "var(--icon-default)"
                                        : "var(--text-secondary)"
                                }
                            />
                        </span>
                        <span
                            style={{
                                ...styles.label,
                                color: selected
                                    ? "var(--text-primary)"
                                    : "var(--text-secondary)",
                            }}
                        >
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

const styles = {
    bar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        height: BOTTOM_NAV_HEIGHT,
        padding: `8px 0 ${8 + NAV_BAR_HEIGHT}px`,
        borderTop: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
    },
    tab: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
    },
    indicator: {
        display: "flex",
        padding: "4px 20px",
        borderRadius: 15,
    },
    label: {
        font: "var(--type-caption)",
    },
} satisfies Record<string, CSSProperties>;
