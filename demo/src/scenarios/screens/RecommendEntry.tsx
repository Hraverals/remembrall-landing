// S6 컨셉 07e: 기억 탭 캡션 아래 · 첫 섹션 위의 추천 진입 줄(앱에 없는 컨셉 화면, 처음 브리프의 명세).
// bg/surface 카드(테두리 border/default, radius md, 안쪽 10 · 12). 왼쪽에 9:16 작은 썸네일 3장(폭 24, 14씩 겹침, radius sm,
// 바램 없음, 흰 테두리), 가운데 본문 · 캡션, 오른쪽 chevron. 탭 대상: recommend-entry.
import type { CSSProperties } from "react";

import { Icon } from "../../kit/ui/Icon";
import { Thumb } from "../../kit/ui/Thumb";
import { recommendEntry } from "./data";

const THUMB_WIDTH = 24;
const OVERLAP = 14;

export function RecommendEntry() {
    return (
        <div data-rmd-target="recommend-entry" style={styles.card}>
            <div style={styles.thumbs}>
                {recommendEntry.photos.map((photo, index) => (
                    <span
                        key={photo}
                        style={{
                            ...styles.thumb,
                            marginLeft: index === 0 ? 0 : -OVERLAP,
                        }}
                    >
                        <Thumb
                            id={photo}
                            fade="recent"
                            width={THUMB_WIDTH}
                            radius={6}
                            showSource={false}
                        />
                    </span>
                ))}
            </div>
            <div style={styles.text}>
                <span style={styles.title}>{recommendEntry.title}</span>
                <span style={styles.caption}>{recommendEntry.areas}</span>
            </div>
            <Icon name="chevronRight" size={18} />
        </div>
    );
}

const styles = {
    card: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-surface)",
    },
    thumbs: {
        display: "flex",
        flex: "none",
    },
    // 흰 테두리 1.5: 겹친 썸네일 사이를 가른다.
    thumb: {
        display: "block",
        border: "1.5px solid var(--bg-surface)",
        borderRadius: 7.5,
    },
    text: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
    },
    title: {
        font: "var(--type-body)",
        color: "var(--text-primary)",
    },
    caption: {
        font: "var(--type-caption)",
        color: "var(--text-secondary)",
    },
} satisfies Record<string, CSSProperties>;
