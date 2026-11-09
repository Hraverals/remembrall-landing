// S1 일반 '저장한 영상' 목록(Remembrall 이 없을 때). 특정 앱을 따라 그리지 않는다: 로고 · 구독 · 재생 같은 고유 UI 가 없다.
// Remembrall 기억 탭과 다르게 보이게 한다: 3열 9:16 그리드가 화면 끝까지 붙고(사이 2) 모서리 · 이름표 · 바램 · 하단 바가 없다.
// 색은 중립 토큰만 쓰고 강조색은 쓰지 않는다.
// added: 새로 쌓인 영상 수(소수 = 들어오는 중). 들어오는 영상은 맨 앞 칸으로 왼쪽에서 들어오고, 나머지는 한 칸씩 오른쪽으로 밀린다.
// 움직임은 가로로만: 줄 끝 칸은 오른쪽으로 나가고, 같은 영상이 다음 줄 첫 칸으로 왼쪽에서 들어온다(그리드 밖은 잘린다).
import type { CSSProperties } from "react";

import { Icon } from "../../kit/ui/Icon";
import {
    NavigationBar,
    STATUS_BAR_HEIGHT,
    StatusBar,
} from "../../kit/ui/StatusBar";
import { Thumb } from "../../kit/ui/Thumb";
import { S1_BASE_COUNT, s1Arrivals, s1Saved } from "./data";

const COLUMNS = 3;
const GAP = 2;
const CELL_WIDTH = (360 - GAP * (COLUMNS - 1)) / COLUMNS;
const CELL_HEIGHT = (CELL_WIDTH * 16) / 9;
const GRID_TOP = STATUS_BAR_HEIGHT + 44 + 32;

const STEP_X = CELL_WIDTH + GAP;

function at(index: number) {
    return {
        x: (index % COLUMNS) * STEP_X,
        y: Math.floor(index / COLUMNS) * (CELL_HEIGHT + GAP),
    };
}

// 칸 번호(소수 = 다음 칸으로 가는 중) → 그릴 조각들. 줄을 넘어가는 중이면 나가는 조각 · 들어오는 조각 둘이다.
function pieces(slot: number): { x: number; y: number }[] {
    const lower = Math.floor(slot);
    const frac = slot - lower;
    const from = at(lower);
    if (frac === 0) return [from];
    if (lower % COLUMNS !== COLUMNS - 1) {
        return [{ x: from.x + STEP_X * frac, y: from.y }];
    }
    const to = at(lower + 1);
    return [
        { x: from.x + STEP_X * frac, y: from.y },
        { x: to.x - STEP_X * (1 - frac), y: to.y },
    ];
}

export function SavedVideosScene({ added }: { added: number }) {
    const arrived = Math.min(s1Arrivals.length, Math.floor(added));
    const entering = arrived < s1Arrivals.length ? added - arrived : 0;
    // 최신순: 이미 들어온 새 영상(나중 것이 앞) → 처음부터 있던 영상.
    const settled = [
        ...s1Arrivals
            .slice(0, arrived)
            .map((photo, index) => ({ key: `new-${index}`, photo }))
            .reverse(),
        ...s1Saved.map((photo, index) => ({ key: `old-${index}`, photo })),
    ];
    const incoming = s1Arrivals[arrived];
    return (
        <div style={styles.screen}>
            <StatusBar />
            <div style={styles.header}>
                <span style={styles.back}>
                    <Icon name="arrowLeft" size={22} />
                </span>
                <span style={styles.title}>저장한 영상</span>
            </div>
            <p style={styles.count}>
                영상 {S1_BASE_COUNT + Math.round(added)}개
            </p>

            <div style={styles.grid}>
                {settled.flatMap((item, index) =>
                    pieces(index + entering).map(({ x, y }, piece) => (
                        <span
                            key={`${item.key}-${piece}`}
                            style={{ ...styles.cell, left: x, top: y }}
                        >
                            <Cell photo={item.photo} />
                        </span>
                    )),
                )}
                {incoming != null && entering > 0 && (
                    <span
                        key={`new-${arrived}-0`}
                        style={{
                            ...styles.cell,
                            left: -STEP_X * (1 - entering),
                            top: 0,
                        }}
                    >
                        <Cell photo={incoming} />
                    </span>
                )}
            </div>

            <NavigationBar />
        </div>
    );
}

function Cell({ photo }: { photo: (typeof s1Saved)[number] }) {
    return (
        <Thumb
            id={photo}
            fade="recent"
            width={CELL_WIDTH}
            radius={0}
            showSource={false}
        />
    );
}

const styles = {
    screen: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "var(--bg-surface)",
    },
    header: {
        position: "absolute",
        top: STATUS_BAR_HEIGHT,
        left: 0,
        right: 0,
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
    title: {
        font: "var(--type-title-card)",
        letterSpacing: "var(--tracking-title-card)",
    },
    count: {
        position: "absolute",
        top: STATUS_BAR_HEIGHT + 44,
        left: 16,
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
    grid: {
        position: "absolute",
        top: GRID_TOP,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
    },
    cell: {
        position: "absolute",
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
    },
} satisfies Record<string, CSSProperties>;
