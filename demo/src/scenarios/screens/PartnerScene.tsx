// S6 컨셉 15 광고주 성과(앱에 없는 컨셉 화면, 처음 브리프의 명세). 보는 사람이 사용자에서 사장님으로 바뀐다.
// 상태 표시줄, 머리("REMEMBRALL 파트너" 캡션 / 가게 이름 Gowun 22 / 기간 캡션), bg/surface 카드 "저장에서 방문까지",
// 줄마다 라벨(본문) · 숫자(Gowun 22) · 저장 대비 비율(캡션, 첫 줄 빼고) · 6px 막대(트랙 bg/subtle, 채움 brand/primary, 저장 대비 비율).
// 이 화면만 버튼이 없어 막대가 강조색을 쓴다. 아래 "이 영상으로 저장됐어요" 두 줄, 맨 아래 예시 안내(처음부터 보인다).
// fill: 줄마다 막대가 차오른 정도 0~1(시나리오가 비트 시작 뒤 차례로 올린다).
import type { CSSProperties } from "react";

import {
    NavigationBar,
    STATUS_BAR_HEIGHT,
    StatusBar,
} from "../../kit/ui/StatusBar";
import { Thumb } from "../../kit/ui/Thumb";
import { partner, percentOfSaves, SAVES_BASE } from "./data";

export function PartnerScene({ fill }: { fill: readonly number[] }) {
    return (
        <div style={styles.screen}>
            <StatusBar />
            <div style={styles.head}>
                <p style={styles.caption}>{partner.caption}</p>
                <p style={styles.name}>{partner.name}</p>
                <p style={styles.caption}>{partner.period}</p>
            </div>

            <div style={styles.card}>
                <p style={styles.cardTitle}>{partner.funnelTitle}</p>
                {partner.funnel.map((row, index) => (
                    <div key={row.label} style={styles.row}>
                        <div style={styles.rowHead}>
                            <span style={styles.label}>{row.label}</span>
                            <span style={styles.numbers}>
                                {index > 0 && (
                                    <span style={styles.caption}>
                                        저장의 {percentOfSaves(row.count)}%
                                    </span>
                                )}
                                <span style={styles.count}>{row.count}</span>
                            </span>
                        </div>
                        <span style={styles.track}>
                            <span
                                style={{
                                    ...styles.bar,
                                    width: `${(row.count / SAVES_BASE) * (fill[index] ?? 0) * 100}%`,
                                }}
                            />
                        </span>
                    </div>
                ))}
            </div>

            <div style={styles.videos}>
                <p style={styles.cardTitle}>{partner.videosTitle}</p>
                {partner.videos.map((video) => (
                    <div key={video.handle} style={styles.video}>
                        <Thumb
                            id={video.photo}
                            fade="recent"
                            width={36}
                            radius={6}
                            showSource={false}
                        />
                        <span style={styles.videoText}>
                            <span style={styles.label}>{video.handle}</span>
                            <span style={styles.caption}>{video.stats}</span>
                        </span>
                    </div>
                ))}
            </div>

            <p style={styles.note}>{partner.note}</p>

            <NavigationBar />
        </div>
    );
}

const styles = {
    screen: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        paddingTop: STATUS_BAR_HEIGHT,
        background: "var(--bg-screen)",
    },
    head: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "24px 20px 0",
    },
    caption: {
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    name: {
        font: "var(--type-heading-screen)",
        letterSpacing: "var(--tracking-heading-screen)",
    },
    card: {
        display: "flex",
        flexDirection: "column",
        gap: 18,
        margin: "24px 20px 0",
        padding: 16,
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-surface)",
    },
    cardTitle: {
        font: "var(--type-title-card)",
        letterSpacing: "var(--tracking-title-card)",
    },
    row: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    rowHead: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 8,
    },
    label: {
        font: "var(--type-body)",
        color: "var(--text-primary)",
    },
    numbers: {
        display: "flex",
        alignItems: "baseline",
        gap: 8,
    },
    count: {
        font: "var(--type-heading-screen)",
        fontVariantNumeric: "tabular-nums",
    },
    track: {
        display: "block",
        height: 6,
        overflow: "hidden",
        borderRadius: 3,
        background: "var(--bg-subtle)",
    },
    bar: {
        display: "block",
        height: "100%",
        borderRadius: 3,
        background: "var(--brand-primary)",
    },
    videos: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "24px 20px 0",
    },
    video: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    videoText: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
    },
    note: {
        marginTop: "auto",
        padding: "0 20px 32px",
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
} satisfies Record<string, CSSProperties>;
