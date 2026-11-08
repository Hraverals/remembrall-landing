// 1 Shorts 처럼 보이는 세로 영상 화면과 안드로이드 공유 시트.
// 영상은 성심당 사진이고, 채널 · 제목은 앱 목(placeDetails 성심당 sourceMeta · sourceTitle)이다.
// YouTube 로고 · 구독 버튼 같은 상표 요소는 그리지 않는다. 오른쪽 아이콘은 일반 lucide 아이콘이다.
// 공유 시트는 시스템 공유 시트 모양이고, 다른 실제 앱 아이콘 없이 일반 항목과 REMEMBRALL(앱 아이콘)만 둔다.
// sheet: 공유 시트가 올라온 정도 0~1(막의 불투명도 · 시트 위치). 탭 대상: 공유 아이콘(share) · 앱(share-app).
import type { CSSProperties } from "react";

import appIcon from "../../assets/icon/app-icon.png";
import { photo } from "../../assets/photos";
import { ANDROID_APP_NAME, shorts } from "../data";
import { Icon, type IconName } from "../ui/Icon";
import { NAV_BAR_HEIGHT, NavigationBar, StatusBar } from "../ui/StatusBar";
import { Thumb } from "../ui/Thumb";

const RAIL: readonly { icon: IconName; label: string }[] = [
    { icon: "heart", label: shorts.likes },
    { icon: "messageCircle", label: shorts.comments },
    { icon: "share", label: "공유" },
];

// 공유 대상. 첫 줄 넷째가 앱이다.
const TARGETS: readonly { icon: IconName | "app"; label: string }[] = [
    { icon: "copy", label: "복사" },
    { icon: "messageSquare", label: "메시지" },
    { icon: "notebookPen", label: "메모" },
    { icon: "app", label: ANDROID_APP_NAME },
    { icon: "mail", label: "이메일" },
    { icon: "bluetooth", label: "블루투스" },
    { icon: "printer", label: "인쇄" },
    { icon: "ellipsis", label: "더보기" },
];

export function ShortsScene({ sheet }: { sheet: number }) {
    return (
        <div style={styles.screen}>
            <img src={photo(shorts.photo)} alt="" style={styles.video} />
            <div style={styles.scrim} />

            <StatusBar tone="light" />

            <div style={styles.rail}>
                {RAIL.map(({ icon, label }) => (
                    <div
                        key={icon}
                        data-demo-target={
                            icon === "share" ? "share" : undefined
                        }
                        style={styles.railItem}
                    >
                        <Icon
                            name={icon}
                            size={28}
                            color="var(--text-on-primary)"
                        />
                        <span style={styles.railLabel}>{label}</span>
                    </div>
                ))}
            </div>

            <div style={styles.info}>
                <div style={styles.channel}>
                    <span style={styles.avatar} />
                    <span style={styles.channelName}>{shorts.channel}</span>
                </div>
                <p style={styles.title}>{shorts.title}</p>
            </div>

            <div style={styles.progress}>
                <span style={styles.progressFill} />
            </div>

            {sheet > 0 && (
                <>
                    <div style={{ ...styles.overlay, opacity: sheet }} />
                    <div
                        style={{
                            ...styles.sheet,
                            transform: `translateY(${(1 - sheet) * 100}%)`,
                        }}
                    >
                        <div style={styles.gripRow}>
                            <span style={styles.grip} />
                        </div>
                        <div style={styles.preview}>
                            <Thumb
                                id={shorts.photo}
                                fade="recent"
                                width={36}
                                radius={6}
                                showSource={false}
                            />
                            <div style={styles.previewText}>
                                <p style={styles.previewTitle}>
                                    {shorts.title}
                                </p>
                                <p style={styles.caption}>{shorts.channel}</p>
                            </div>
                        </div>
                        <div style={styles.targets}>
                            {TARGETS.map(({ icon, label }) => (
                                <div
                                    key={label}
                                    data-demo-target={
                                        icon === "app" ? "share-app" : undefined
                                    }
                                    style={styles.target}
                                >
                                    {icon === "app" ? (
                                        <img
                                            src={appIcon}
                                            alt=""
                                            style={styles.appIcon}
                                        />
                                    ) : (
                                        <span style={styles.targetIcon}>
                                            <Icon name={icon} size={22} />
                                        </span>
                                    )}
                                    <span style={styles.targetLabel}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <NavigationBar tone={sheet > 0.5 ? "dark" : "light"} />
        </div>
    );
}

const oneLine: CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
};

const styles = {
    screen: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "var(--text-primary)",
    },
    video: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    // 글자가 읽히도록 위아래만 어둡게 한다(text/primary 계열).
    scrim: {
        position: "absolute",
        inset: 0,
        background:
            "linear-gradient(to bottom, #2a212659 0%, #2a212600 14%, #2a212600 52%, #2a2126c2 100%)",
    },
    rail: {
        position: "absolute",
        right: 10,
        bottom: 132,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
    },
    railItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: 48,
    },
    railLabel: {
        font: "var(--type-caption)",
        color: "var(--text-on-primary)",
    },
    info: {
        position: "absolute",
        left: 16,
        right: 76,
        bottom: 52,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        color: "var(--text-on-primary)",
    },
    channel: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-subtle)",
    },
    channelName: {
        font: "var(--type-label-button)",
    },
    title: {
        font: "var(--type-body)",
    },
    progress: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: NAV_BAR_HEIGHT + 12,
        height: 2,
        background: "#fffcfa4d",
    },
    progressFill: {
        display: "block",
        width: "38%",
        height: "100%",
        background: "var(--text-on-primary)",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        background: "var(--bg-overlay)",
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: 16 + NAV_BAR_HEIGHT,
        borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        background: "var(--bg-surface)",
    },
    gripRow: {
        display: "flex",
        justifyContent: "center",
        padding: "8px 0 12px",
    },
    grip: {
        width: 36,
        height: 4,
        borderRadius: 2,
        background: "var(--border-default)",
    },
    preview: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "4px 20px 16px",
        borderBottom: "1px solid var(--border-default)",
    },
    previewText: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
    },
    previewTitle: {
        ...oneLine,
        font: "var(--type-label-button)",
    },
    caption: {
        ...oneLine,
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    targets: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        rowGap: 20,
        padding: "20px 12px 4px",
    },
    target: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
    },
    targetIcon: {
        display: "grid",
        placeItems: "center",
        width: 52,
        height: 52,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-subtle)",
    },
    // 안드로이드 런처처럼 원으로 자른다.
    appIcon: {
        width: 52,
        height: 52,
        borderRadius: "var(--radius-full)",
    },
    targetLabel: {
        ...oneLine,
        maxWidth: 76,
        font: "var(--type-caption)",
        color: "var(--text-on-subtle)",
    },
} satisfies Record<string, CSSProperties>;
