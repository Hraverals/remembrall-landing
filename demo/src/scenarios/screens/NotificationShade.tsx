// 6 알림창을 내린 상태. 지도 탭 위에 겹친다(앱이 켜져 있어도 배너 없이 알림창에만 쌓인다: shouldShowBanner false · shouldShowList true).
// 위에서 내려온 패널: 큰 시각 · 날짜, 빠른 설정 타일 넷(아이콘만), 알림 카드 하나.
// 알림 카드: 작은 아이콘(notification-icon, expo-notifications color #6B4E7A = brand/primary) · 앱 이름 · "지금",
// 제목은 장소 이름, 본문은 앱 규칙(nearbyNotificationBody)으로 now 기준 계산한다.
// pull: 끌어내린 정도 0~1(막의 불투명도 · 패널 위치). 손가락과 같은 시각 · easing 이다. 탭 대상: 알림 카드(notification).
import type { CSSProperties } from "react";

import notificationIcon from "../../kit/assets/icon/notification-icon.png";
import { nearbyBody } from "./album";
import { ANDROID_APP_NAME, saves } from "./data";
import { Icon, type IconName } from "../../kit/ui/Icon";
import { StatusBar } from "../../kit/ui/StatusBar";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const TILES: readonly IconName[] = ["wifi", "bluetooth", "flashlight", "moon"];

function dateLabel(now: Date): string {
    return `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAYS[now.getDay()]}요일`;
}

export function NotificationShade({ now, pull }: { now: Date; pull: number }) {
    const saved = saves[0];
    if (saved == null) return null;
    return (
        <>
            <div style={{ ...styles.dim, opacity: pull }} />
            <div
                style={{
                    ...styles.panel,
                    transform: `translateY(${(pull - 1) * 100}%)`,
                }}
            >
                <StatusBar />
                <div style={styles.clockRow}>
                    <span style={styles.clock}>2:14</span>
                    <span style={styles.date}>{dateLabel(now)}</span>
                </div>
                <div style={styles.tiles}>
                    {TILES.map((tile) => (
                        <span key={tile} style={styles.tile}>
                            <Icon name={tile} size={20} />
                        </span>
                    ))}
                </div>
                <div data-rmd-target="notification" style={styles.card}>
                    <div style={styles.cardHead}>
                        <span style={styles.smallIcon} />
                        <span>{ANDROID_APP_NAME}</span>
                        <span aria-hidden="true">·</span>
                        <span>지금</span>
                    </div>
                    <p style={styles.cardTitle}>{saved.place}</p>
                    <p style={styles.cardBody}>
                        {nearbyBody(saved.savedAt, now)}
                    </p>
                </div>
                <span style={styles.handle} />
            </div>
        </>
    );
}

const styles = {
    // 아래 장면의 상태 표시줄(z-index 10)보다 위에 온다.
    dim: {
        position: "absolute",
        inset: 0,
        zIndex: 20,
        background: "var(--bg-overlay)",
    },
    panel: {
        position: "absolute",
        zIndex: 20,
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "44px 12px 12px",
        borderRadius: "0 0 28px 28px",
        background: "var(--bg-subtle)",
    },
    clockRow: {
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        paddingInline: 8,
    },
    clock: {
        font: "400 34px / 40px var(--font-body)",
        fontVariantNumeric: "tabular-nums",
    },
    date: {
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    tiles: {
        display: "flex",
        gap: 10,
        paddingInline: 8,
    },
    tile: {
        display: "grid",
        placeItems: "center",
        width: 48,
        height: 48,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-surface)",
    },
    card: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "14px 16px 16px",
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-surface)",
    },
    cardHead: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    smallIcon: {
        width: 16,
        height: 16,
        background: "var(--brand-primary)",
        maskImage: `url(${notificationIcon})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
    },
    cardTitle: {
        font: "var(--type-label-button)",
    },
    cardBody: {
        font: "var(--type-body)",
        color: "var(--text-on-subtle)",
    },
    handle: {
        alignSelf: "center",
        width: 36,
        height: 4,
        borderRadius: 2,
        background: "var(--border-default)",
    },
} satisfies Record<string, CSSProperties>;
