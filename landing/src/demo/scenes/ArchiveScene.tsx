// 3 · 4 기억 탭(앱 07, features/archive). 헤더 "기억" + 톱니, 캡션, 시간순 앨범(3열), 하단 바(기억 선택).
// 섹션 · 바램 · 이름은 앱 규칙(album.ts)으로 now 기준 계산한다. 3주 뒤(4)도 같은 규칙이라 성심당은 맨 앞 칸에서 바랜다.
// analyzing: 맨 앞(방금 공유한 성심당) 셀이 "분석 중" 배지 · "제목 없는 영상"이다. 끝나면 장소명으로 바뀐다.
// 화면 밖으로 넘치는 셀은 잘린다(앱도 스크롤 전에는 첫 화면만 보인다).
import type { CSSProperties } from "react";

import { toAlbumSections } from "../album";
import { saves } from "../data";
import { Badge } from "../ui/Badge";
import { BOTTOM_NAV_HEIGHT, BottomNav } from "../ui/BottomNav";
import { SCREEN_HEADER_BOTTOM, ScreenHeader } from "../ui/ScreenHeader";
import { NavigationBar, StatusBar } from "../ui/StatusBar";
import { Thumb } from "../ui/Thumb";

const COLUMNS = 3;
// 화면 폭 360 - 좌우 20 · 20 - 칸 사이 8 · 8.
const CELL_WIDTH = (360 - 40 - 16) / COLUMNS;

type Props = {
    now: Date;
    analyzing: boolean;
};

export function ArchiveScene({ now, analyzing }: Props) {
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
                                                fade={item.fade}
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
