// 기억 탭(앱 07, features/archive). 헤더 "기억" + 톱니, 캡션, 시간순 앨범(3열), 하단 바(기억 선택).
// 섹션 · 이름은 앱 규칙(album.ts toAlbumSections)으로 now 기준 계산한다. 캡션도 앱 문구(모두 N개 · …)다.
// analyzing: 맨 앞(방금 공유한 성심당) 셀이 "분석 중" 배지 · "제목 없는 영상"이다. 끝나면 장소명으로 바뀐다.
// 화면 밖으로 넘치는 셀은 잘린다(앱도 스크롤 전에는 첫 화면만 보인다).
// fade: 셀 바램(단계 또는 불투명도). 없으면 앱 규칙대로 fadeFor(savedAt, now). 시점 사이를 이어 바꿀 때 시나리오가 준다(S4).
import type { CSSProperties, ReactNode } from "react";

import { type DemoSave, fadeFor, toAlbumSections } from "./album";
import type { Fade } from "../../kit/ui/fade";
import { saves as demoSaves } from "./data";
import { Badge } from "../../kit/ui/Badge";
import { BOTTOM_NAV_HEIGHT, BottomNav } from "../../kit/ui/BottomNav";
import { SCREEN_HEADER_BOTTOM, ScreenHeader } from "../../kit/ui/ScreenHeader";
import { NavigationBar, StatusBar } from "../../kit/ui/StatusBar";
import { Thumb } from "../../kit/ui/Thumb";

const COLUMNS = 3;
// 화면 폭 360 - 좌우 20 · 20 - 칸 사이 8 · 8.
const CELL_WIDTH = (360 - 40 - 16) / COLUMNS;

type Props = {
    now: Date;
    analyzing?: boolean;
    fade?: (savedAt: Date) => Fade | number;
    // 저장물(최신 저장순). 없으면 데모 저장물 9개. 캡션의 개수도 이 목록으로 센다.
    saves?: readonly DemoSave[];
    // 캡션과 첫 섹션 사이에 넣는 줄(S6 컨셉 07e 추천 진입 줄).
    entry?: ReactNode;
};

export function ArchiveScene({
    now,
    analyzing = false,
    fade = (savedAt) => fadeFor(savedAt, now),
    saves = demoSaves,
    entry,
}: Props) {
    const sections = toAlbumSections(
        saves.map((save, index) =>
            index === 0 ? { ...save, analyzing } : save,
        ),
        now,
    );
    return (
        <div style={styles.screen}>
            <StatusBar />
            <ScreenHeader title="기억" />

            <div style={styles.scroll}>
                <p style={styles.intro}>
                    모두 {saves.length}개 · 오래 잊은 것일수록 바래 있어요
                </p>
                {entry != null && <div style={styles.entry}>{entry}</div>}
                <div style={styles.album}>
                    {sections.map((section) => (
                        <section key={section.key} style={styles.section}>
                            <h3 style={styles.sectionTitle}>{section.title}</h3>
                            <div style={styles.grid}>
                                {section.items.map((item) => (
                                    <div key={item.save.id} style={styles.cell}>
                                        <div style={styles.thumb}>
                                            <Thumb
                                                id={item.save.photo}
                                                fade={fade(item.save.savedAt)}
                                                width={CELL_WIDTH}
                                            />
                                            {item.badge != null && (
                                                <span style={styles.badge}>
                                                    <Badge
                                                        status={item.badge}
                                                    />
                                                </span>
                                            )}
                                        </div>
                                        <span style={styles.label}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <BottomNav active="archive" />
            <NavigationBar />
        </div>
    );
}

const styles = {
    screen: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "var(--bg-screen)",
    },
    scroll: {
        position: "absolute",
        top: SCREEN_HEADER_BOTTOM,
        left: 0,
        right: 0,
        bottom: BOTTOM_NAV_HEIGHT,
        overflow: "hidden",
    },
    // 진입 줄: 캡션 아래 12, 좌우 20.
    entry: {
        padding: "12px 20px 0",
    },
    intro: {
        padding: "20px 20px 0",
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    // 섹션 사이 32, 위 20, 좌우 20.
    album: {
        display: "flex",
        flexDirection: "column",
        gap: 32,
        padding: "20px 20px 0",
    },
    section: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    sectionTitle: {
        margin: 0,
        font: "var(--type-heading-screen)",
        letterSpacing: "var(--tracking-heading-screen)",
    },
    // 줄 사이 12, 칸 사이 8.
    grid: {
        display: "grid",
        gridTemplateColumns: `repeat(${COLUMNS}, ${CELL_WIDTH}px)`,
        columnGap: 8,
        rowGap: 12,
    },
    cell: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
    },
    thumb: {
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: 6,
        left: 6,
    },
    label: {
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        font: "var(--type-caption)",
        color: "var(--text-on-subtle)",
    },
} satisfies Record<string, CSSProperties>;
