// S6 컨셉 14 추천(앱에 없는 컨셉 화면, 처음 브리프의 명세). 상태 표시줄, 뒤로 + "추천" 헤더, 캡션, 동네별 섹션, 하단 바 없음.
// 섹션: 동네 이름(Gowun 22) / 이유(캡션). 카드 가로 줄(좌 20, 간격 12, 카드 폭 132, 2.5장 보임, 넘치는 카드는 잘린다).
// 카드: 9:16 썸네일(바램 없음) 오른쪽 위 32 원형 저장 버튼(bookmark-plus, bg/surface 92%), 아래 이름(14/500) · 거리(캡션).
// 광고 카드: 썸네일 왼쪽 위 중립색 "광고" 배지(bg/surface 92%, 11/500, radius sm), 이름 아래 한 줄 더(캡션 text/primary).
// saved: 광고 카드 저장 버튼이 저장된 상태(bookmark-check). 바탕은 그대로 중립색이다(강조색은 15 막대에만). 탭 대상: ad-save.
// 두 번째 섹션은 화면 아래로 넘쳐 일부만 보인다.
import type { CSSProperties } from "react";

import { Icon } from "../../kit/ui/Icon";
import {
    NavigationBar,
    STATUS_BAR_HEIGHT,
    StatusBar,
} from "../../kit/ui/StatusBar";
import { Thumb } from "../../kit/ui/Thumb";
import { AD_CARD_ID, type RecommendCard, recommendSections } from "./data";

const CARD_WIDTH = 132;
const SURFACE_92 = "color-mix(in srgb, var(--bg-surface) 92%, transparent)";

export function RecommendScene({ saved }: { saved: boolean }) {
    return (
        <div style={styles.screen}>
            <StatusBar />
            <div style={styles.header}>
                <span style={styles.back}>
                    <Icon name="arrowLeft" size={22} />
                </span>
                <span style={styles.headerTitle}>추천</span>
            </div>
            <p style={styles.intro}>저장한 곳을 바탕으로 골랐어요</p>

            <div style={styles.sections}>
                {recommendSections.map((section) => (
                    <section key={section.area} style={styles.section}>
                        <div style={styles.sectionHead}>
                            <h3 style={styles.area}>{section.area}</h3>
                            <p style={styles.caption}>{section.reason}</p>
                        </div>
                        <div style={styles.row}>
                            {section.cards.map((card) => (
                                <Card
                                    key={card.id}
                                    card={card}
                                    saved={saved && card.id === AD_CARD_ID}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <NavigationBar />
        </div>
    );
}

function Card({ card, saved }: { card: RecommendCard; saved: boolean }) {
    return (
        <div style={styles.card}>
            <div style={styles.thumb}>
                <Thumb id={card.photo} fade="recent" width={CARD_WIDTH} />
                {card.ad != null && <span style={styles.adBadge}>광고</span>}
                <span
                    data-rmd-target={card.ad != null ? "ad-save" : undefined}
                    style={styles.save}
                >
                    <Icon
                        name={saved ? "bookmarkCheck" : "bookmarkPlus"}
                        size={18}
                    />
                </span>
            </div>
            <div style={styles.cardText}>
                <span style={styles.name}>{card.name}</span>
                <span style={styles.caption}>{card.walk}</span>
                {card.ad != null && (
                    <span style={styles.adLine}>{card.ad.line}</span>
                )}
            </div>
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
        paddingTop: STATUS_BAR_HEIGHT,
        background: "var(--bg-screen)",
    },
    // 뒤로(40 버튼 · 아이콘 22) + 제목(Title/Card). 높이 44, 왼쪽 8.
    header: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        height: 44,
        paddingLeft: 8,
    },
    back: {
        display: "grid",
        placeItems: "center",
        width: 40,
        height: 40,
    },
    headerTitle: {
        font: "var(--type-title-card)",
        letterSpacing: "var(--tracking-title-card)",
    },
    intro: {
        padding: "8px 20px 0",
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    // 섹션 사이 32, 위 24.
    sections: {
        display: "flex",
        flexDirection: "column",
        gap: 32,
        paddingTop: 24,
    },
    section: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    sectionHead: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        paddingInline: 20,
    },
    area: {
        font: "var(--type-heading-screen)",
        letterSpacing: "var(--tracking-heading-screen)",
    },
    caption: {
        ...oneLine,
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    row: {
        display: "flex",
        gap: 12,
        paddingLeft: 20,
    },
    card: {
        flex: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: CARD_WIDTH,
    },
    thumb: {
        position: "relative",
    },
    adBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        padding: "2px 6px",
        borderRadius: "var(--radius-sm)",
        background: SURFACE_92,
        color: "var(--text-on-subtle)",
        font: "500 11px / 14px var(--font-body)",
    },
    save: {
        position: "absolute",
        top: 6,
        right: 6,
        display: "grid",
        placeItems: "center",
        width: 32,
        height: 32,
        borderRadius: "var(--radius-full)",
        background: SURFACE_92,
    },
    cardText: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 0,
    },
    name: {
        ...oneLine,
        font: "500 14px / 20px var(--font-body)",
        color: "var(--text-primary)",
    },
    adLine: {
        ...oneLine,
        font: "var(--type-caption)",
        color: "var(--text-primary)",
    },
} satisfies Record<string, CSSProperties>;
