// 08 장소 상세. 지도 위에 시트. 시트 구성과 수치는 앱 features/content-detail(DetailSheet · DetailFooter)과 같다.
// 지도: 현재 위치 → 장소 점선 경로(text/secondary 2, 점선 4 · 4), 장소 사진 핀(폭 40, 테두리 3, 그림자)과 이름표.
// fade 는 핀 · 썸네일의 바램이다. 데모가 이 장면에 닿으면 바랬던 사진이 원래 색(recent)으로 돌아온다.
import type { CSSProperties } from "react";

import { photo } from "../../assets/photos";
import { detailMap, sungsimdang as detail } from "../data";
import { DemoMap } from "../ui/DemoMap";
import { Icon } from "../ui/Icon";
import {
    NAV_BAR_HEIGHT,
    NavigationBar,
    StatusBar,
    STATUS_BAR_HEIGHT,
} from "../ui/StatusBar";
import { type Fade, Thumb } from "../ui/Thumb";

const FADE_OPACITY: Record<Fade, string> = {
    recent: "var(--fade-recent)",
    weeks: "var(--fade-weeks)",
    months: "var(--fade-months)",
};

const PIN_WIDTH = 40;
const PIN_HEIGHT = (PIN_WIDTH * 16) / 9;

export function DetailScene({ fade }: { fade: Fade }) {
    const { place, current } = detailMap;
    return (
        <div style={styles.screen}>
            <DemoMap />

            <svg width="360" height="800" style={styles.overlay}>
                <line
                    x1={current.x}
                    y1={current.y}
                    x2={place.x}
                    y2={place.y}
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
            </svg>

            <div
                style={{
                    ...styles.current,
                    left: current.x - 22,
                    top: current.y - 22,
                }}
            >
                <span style={styles.halo} />
                <span style={styles.dot} />
            </div>

            <div
                style={{
                    ...styles.pin,
                    left: place.x - PIN_WIDTH / 2,
                    top: place.y - PIN_HEIGHT,
                }}
            >
                <img
                    src={photo(detail.photo, "sm")}
                    alt=""
                    style={styles.fill}
                />
                <span
                    data-fade={fade}
                    style={{
                        ...styles.fill,
                        ...styles.fadeLayer,
                        opacity: FADE_OPACITY[fade],
                    }}
                />
            </div>
            <div
                style={{ ...styles.pinLabel, left: place.x, top: place.y + 7 }}
            >
                {detail.place}
            </div>

            <StatusBar />

            <div style={styles.back}>
                <Icon name="arrowLeft" size={22} />
            </div>

            <div style={styles.sheet}>
                <div style={styles.handleRow}>
                    <span style={styles.handle} />
                </div>
                <div style={styles.body}>
                    <div style={styles.head}>
                        <Thumb id={detail.photo} fade={fade} width={72} />
                        <div style={styles.info}>
                            <p style={styles.time}>{detail.time}</p>
                            <p style={styles.place}>{detail.place}</p>
                            <p style={styles.caption}>
                                {detail.address} · {detail.walk}
                            </p>
                        </div>
                    </div>

                    <div style={styles.note}>
                        <p style={styles.caption}>영상에서 저장해둔 것</p>
                        <p style={styles.noteBody}>{detail.note}</p>
                        <div style={styles.tags}>
                            {detail.tags.map((tag) => (
                                <span key={tag} style={styles.tag}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={styles.source}>
                        <div style={styles.sourceText}>
                            <p style={styles.sourceTitle}>
                                원본 영상 다시 보기
                            </p>
                            <p style={styles.caption}>{detail.sourceMeta}</p>
                        </div>
                        <Icon name="chevronRight" size={18} />
                    </div>
                </div>

                <div style={styles.actions}>
                    <div style={{ ...styles.button, ...styles.primary }}>
                        길 안내 시작
                    </div>
                    <div style={{ ...styles.button, ...styles.textButton }}>
                        이 장소가 아니에요
                    </div>
                </div>
            </div>

            <NavigationBar />
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
        background: "var(--bg-screen)",
    },
    overlay: {
        position: "absolute",
        inset: 0,
    },
    fill: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    fadeLayer: {
        background: "var(--bg-fade)",
    },
    // 현재 위치: 바깥 원 44(status/info-fg 15%), 안쪽 점 14(bg/surface 테두리 3).
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
    // 08 장소 핀(variant detail): 테두리는 크기 안쪽, 그림자 Elevation/Low.
    pin: {
        position: "absolute",
        width: PIN_WIDTH,
        height: PIN_HEIGHT,
        overflow: "hidden",
        border: "3px solid var(--bg-surface)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-placeholder)",
        boxShadow: "var(--elevation-low)",
    },
    pinLabel: {
        position: "absolute",
        transform: "translateX(-50%)",
        padding: "3px 8px",
        borderRadius: "var(--radius-full)",
        background: "var(--text-primary)",
        color: "var(--text-on-primary)",
        font: "var(--type-caption)",
        whiteSpace: "nowrap",
    },
    // 뒤로가기: 상태 표시줄 아래 md, 왼쪽 16, 38 원.
    back: {
        position: "absolute",
        top: STATUS_BAR_HEIGHT + 12,
        left: 16,
        display: "grid",
        placeItems: "center",
        width: 38,
        height: 38,
        borderRadius: "var(--radius-full)",
        background: "var(--bg-surface)",
        boxShadow: "var(--elevation-low)",
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        background: "var(--bg-surface)",
        boxShadow: "var(--elevation-low)",
    },
    // 핸들: 위 10, 36 × 4.
    handleRow: {
        display: "flex",
        justifyContent: "center",
        paddingTop: 10,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        background: "var(--bg-placeholder)",
    },
    // 핸들 아래 16, 좌우 20, 묶음 사이 16.
    body: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px 20px 0",
    },
    head: {
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
    },
    info: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    time: {
        ...oneLine,
        font: "var(--type-heading-screen)",
        letterSpacing: "var(--tracking-heading-screen)",
    },
    place: {
        ...oneLine,
        font: "var(--type-title-card)",
        letterSpacing: "var(--tracking-title-card)",
    },
    caption: {
        ...oneLine,
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    note: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    // 기본 지점에서 메모는 2줄로 줄인다.
    noteBody: {
        font: "var(--type-body)",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    tags: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
    },
    tag: {
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-subtle)",
        color: "var(--text-on-subtle)",
        font: "var(--type-caption)",
    },
    // 원본 영상 줄: 높이 64, 테두리 1 은 크기 안쪽.
    source: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 64,
        padding: "0 12px 0 14px",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
    },
    sourceText: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    sourceTitle: {
        ...oneLine,
        font: "var(--type-label-button)",
    },
    // 하단 버튼: 시트 간격 16 뒤, 버튼 사이 4, 아래 24 + 제스처 막대.
    actions: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: `16px 20px ${24 + NAV_BAR_HEIGHT}px`,
    },
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        borderRadius: "var(--radius-md)",
        font: "var(--type-label-button)",
    },
    primary: {
        background: "var(--brand-primary)",
        color: "var(--text-on-primary)",
    },
    textButton: {
        color: "var(--text-on-subtle)",
    },
} satisfies Record<string, CSSProperties>;
